import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from '../../firebase';
import type {
  CreateHabitInput,
  DailyAssignmentDoc,
  HabitDoc,
  HabitHistoryDoc,
  UpdateHabitInput,
  UserStatsDoc,
} from '../types/tasks';

const HABITS = 'habits';
const HABIT_HISTORY = 'habitHistory';
const DAILY_ASSIGNMENTS = 'dailyAssignments';
const USER_STATS = 'userStats';

function nowIso() {
  return new Date().toISOString();
}

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getCurrentUserId(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('No authenticated user.');
  }
  return uid;
}

function clampCount(value: number, target: number) {
  return Math.max(0, Math.min(value, Math.max(1, target)));
}

function calculateLevel(totalXp: number) {
  return Math.floor(totalXp / 100) + 1;
}

function getNextResetAt(repetition: HabitDoc['repetition'], anchorIso: string): string | null {
  const anchor = new Date(anchorIso);

  if (repetition === 'One Time') {
    return null;
  }

  const next = new Date(anchor);

  if (repetition === 'Daily') {
    next.setDate(next.getDate() + 1);
  } else if (repetition === 'Weekly') {
    next.setDate(next.getDate() + 7);
  }

  return next.toISOString();
}

function getFollowingResetAt(repetition: HabitDoc['repetition'], currentNextResetAt: string | null): string | null {
  if (!currentNextResetAt) return null;

  const next = new Date(currentNextResetAt);

  if (repetition === 'Daily') {
    next.setDate(next.getDate() + 1);
  } else if (repetition === 'Weekly') {
    next.setDate(next.getDate() + 7);
  } else {
    return null;
  }

  return next.toISOString();
}

function getXpForResult(result: 'completed' | 'partial' | 'missed', baseXp: number) {
  if (result === 'completed') return baseXp;
  if (result === 'partial') return Math.floor(baseXp / 2);
  return 0;
}

export async function ensureUserStats(userId?: string) {
  const uid = userId ?? getCurrentUserId();
  const ref = doc(db, USER_STATS, uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    const payload: UserStatsDoc = {
      userId: uid,
      totalXp: 0,
      level: 1,
      longestStreak: 0,
      updatedAt: nowIso(),
    };
    await setDoc(ref, payload);
  }
}

export async function createHabit(input: CreateHabitInput) {
  const userId = getCurrentUserId();
  await ensureUserStats(userId);

  const habitRef = doc(collection(db, HABITS));
  const createdAt = nowIso();
  const cleanTarget = Math.max(1, input.targetCount);

  const habit: HabitDoc = {
    id: habitRef.id,
    userId,

    title: input.title.trim(),
    subtitle: input.subtitle?.trim() ?? '',

    currentCount: 0,
    targetCount: cleanTarget,
    repetition: input.repetition,

    reminderEnabled: input.reminderEnabled,
    reminderTime: input.reminderEnabled ? input.reminderTime ?? '' : '',
    notificationId: input.reminderEnabled ? input.notificationId ?? null : null,

    createdAt,
    resetAnchorDate: createdAt,
    nextResetAt: getNextResetAt(input.repetition, createdAt),
    lastCompletedAt: null,

    completionCount: 0,
    partialCount: 0,
    missedCount: 0,

    currentStreak: 0,
    longestStreak: 0,

    xp: cleanTarget * 10,
    bonusXpEligible: false,

    archived: false,
  };

  await setDoc(habitRef, habit);
  return habit;
}

export function subscribeToHabits(
  onData: (habits: HabitDoc[]) => void,
  onError?: (error: Error) => void
) {
  const userId = getCurrentUserId();

  const q = query(
    collection(db, HABITS),
    where('userId', '==', userId),
    where('archived', '==', false),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const habits = snapshot.docs.map((docSnap) => docSnap.data() as HabitDoc);
      onData(habits);
    },
    (error) => {
      onError?.(error);
    }
  );
}

export async function updateHabitProgress(habitId: string, nextCount: number) {
  const userId = getCurrentUserId();
  const ref = doc(db, HABITS, habitId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) {
      throw new Error('Habit not found.');
    }

    const habit = snap.data() as HabitDoc;
    if (habit.userId !== userId) {
      throw new Error('Unauthorized habit update.');
    }

    const clamped = clampCount(nextCount, habit.targetCount);
    const becameCompleted =
      clamped >= habit.targetCount && habit.currentCount < habit.targetCount;

    tx.update(ref, {
      currentCount: clamped,
      lastCompletedAt: becameCompleted ? nowIso() : habit.lastCompletedAt,
    });
  });
}

export async function toggleHabitComplete(habitId: string) {
  const userId = getCurrentUserId();
  const ref = doc(db, HABITS, habitId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) {
      throw new Error('Habit not found.');
    }

    const habit = snap.data() as HabitDoc;
    if (habit.userId !== userId) {
      throw new Error('Unauthorized habit update.');
    }

    const isCompleted = habit.currentCount >= habit.targetCount;
    const nextCount = isCompleted ? 0 : habit.targetCount;

    tx.update(ref, {
      currentCount: nextCount,
      lastCompletedAt: !isCompleted ? nowIso() : habit.lastCompletedAt,
    });
  });
}

export async function updateHabitDetails(habitId: string, updates: UpdateHabitInput) {
  const userId = getCurrentUserId();
  const ref = doc(db, HABITS, habitId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) {
      throw new Error('Habit not found.');
    }

    const habit = snap.data() as HabitDoc;
    if (habit.userId !== userId) {
      throw new Error('Unauthorized habit update.');
    }

    const nextTarget = updates.targetCount
      ? Math.max(1, updates.targetCount)
      : habit.targetCount;

    const nextRepetition = updates.repetition ?? habit.repetition;

    tx.update(ref, {
      title: updates.title?.trim() ?? habit.title,
      subtitle: updates.subtitle?.trim() ?? habit.subtitle,
      targetCount: nextTarget,
      currentCount: clampCount(habit.currentCount, nextTarget),
      repetition: nextRepetition,
      reminderEnabled: updates.reminderEnabled ?? habit.reminderEnabled,
      reminderTime:
        updates.reminderEnabled === false
          ? ''
          : updates.reminderTime ?? habit.reminderTime,
      notificationId:
        updates.reminderEnabled === false
          ? null
          : updates.notificationId ?? habit.notificationId,
      archived: updates.archived ?? habit.archived,
      nextResetAt:
        nextRepetition !== habit.repetition
          ? getNextResetAt(nextRepetition, habit.resetAnchorDate)
          : habit.nextResetAt,
      xp: nextTarget * 10,
    });
  });
}

export async function deleteHabit(habitId: string) {
  const userId = getCurrentUserId();
  const ref = doc(db, HABITS, habitId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const habit = snap.data() as HabitDoc;
  if (habit.userId !== userId) {
    throw new Error('Unauthorized habit delete.');
  }

  await deleteDoc(ref);
}

export async function processHabitResets() {
  const userId = getCurrentUserId();
  await ensureUserStats(userId);

  const habitsQuery = query(
    collection(db, HABITS),
    where('userId', '==', userId),
    where('archived', '==', false)
  );

  const snapshot = await getDocs(habitsQuery);
  const now = new Date();

  for (const habitSnap of snapshot.docs) {
    const habit = habitSnap.data() as HabitDoc;

    if (!habit.nextResetAt) continue;

    const nextReset = toDate(habit.nextResetAt);
    if (!nextReset || nextReset > now) continue;

    const cycleStart = habit.resetAnchorDate;
    const cycleEnd = habit.nextResetAt;

    const result: HabitHistoryDoc['result'] =
      habit.currentCount >= habit.targetCount
        ? 'completed'
        : habit.currentCount > 0
        ? 'partial'
        : 'missed';

    const xpEarned = getXpForResult(result, habit.xp);
    const nextCurrentStreak = result === 'completed' ? habit.currentStreak + 1 : 0;
    const nextLongestStreak = Math.max(habit.longestStreak, nextCurrentStreak);

    const historyRef = doc(collection(db, HABIT_HISTORY));
    const statsRef = doc(db, USER_STATS, userId);
    const habitRef = doc(db, HABITS, habit.id);

    await runTransaction(db, async (tx) => {
      const statsSnap = await tx.get(statsRef);
      const currentStats = statsSnap.exists()
        ? (statsSnap.data() as UserStatsDoc)
        : {
            userId,
            totalXp: 0,
            level: 1,
            longestStreak: 0,
            updatedAt: nowIso(),
          };

      const totalXp = currentStats.totalXp + xpEarned;
      const longestStreak = Math.max(currentStats.longestStreak, nextLongestStreak);

      const historyDoc: HabitHistoryDoc = {
        id: historyRef.id,
        userId,
        habitId: habit.id,
        cycleStart,
        cycleEnd,
        result,
        finalCount: habit.currentCount,
        targetCount: habit.targetCount,
        xpEarned,
        wasDaily: false,
        createdAt: nowIso(),
      };

      tx.set(historyRef, historyDoc);

      tx.update(habitRef, {
        currentCount: 0,
        resetAnchorDate: cycleEnd,
        nextResetAt: getFollowingResetAt(habit.repetition, habit.nextResetAt),
        completionCount:
          result === 'completed' ? habit.completionCount + 1 : habit.completionCount,
        partialCount:
          result === 'partial' ? habit.partialCount + 1 : habit.partialCount,
        missedCount:
          result === 'missed' ? habit.missedCount + 1 : habit.missedCount,
        currentStreak: nextCurrentStreak,
        longestStreak: nextLongestStreak,
      });

      tx.set(
        statsRef,
        {
          userId,
          totalXp,
          level: calculateLevel(totalXp),
          longestStreak,
          updatedAt: nowIso(),
        },
        { merge: true }
      );
    });
  }
}

export async function assignDailyHabitsForToday() {
  const userId = getCurrentUserId();
  const today = new Date();
  const dateKey = today.toISOString().slice(0, 10);

  const existingQuery = query(
    collection(db, DAILY_ASSIGNMENTS),
    where('userId', '==', userId),
    where('dateKey', '==', dateKey),
    limit(1)
  );

  const existing = await getDocs(existingQuery);
  if (!existing.empty) return;

  const habitsQuery = query(
    collection(db, HABITS),
    where('userId', '==', userId),
    where('archived', '==', false)
  );

  const snapshot = await getDocs(habitsQuery);
  const habits = snapshot.docs
    .map((docSnap) => docSnap.data() as HabitDoc)
    .filter((habit) => habit.repetition !== 'One Time');

  if (habits.length === 0) return;

  const sorted = [...habits].sort((a, b) => {
    if (a.completionCount !== b.completionCount) {
      return a.completionCount - b.completionCount;
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const count = Math.max(1, Math.floor(habits.length / 3));
  const selected = sorted.slice(0, count);

  const batch = writeBatch(db);

  selected.forEach((habit) => {
    const ref = doc(collection(db, DAILY_ASSIGNMENTS));
    const payload: DailyAssignmentDoc = {
      id: ref.id,
      userId,
      dateKey,
      habitId: habit.id,
      createdAt: nowIso(),
    };
    batch.set(ref, payload);
  });

  await batch.commit();
}

export async function getHabitHistory(habitId: string) {
  const userId = getCurrentUserId();

  const q = query(
    collection(db, HABIT_HISTORY),
    where('userId', '==', userId),
    where('habitId', '==', habitId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => docSnap.data() as HabitHistoryDoc);
}