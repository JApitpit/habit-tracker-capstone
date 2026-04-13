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
  UpdateProgressOptions,
  UserStatsDoc,
} from '../types/tasks';
import type { MoneyTransactionDoc, UserMoneyDoc } from '../types/money';

const HABITS = 'habits';
const HABIT_HISTORY = 'habitHistory';
const DAILY_ASSIGNMENTS = 'dailyAssignments';
const USER_STATS = 'userStats';
const USER_MONEY = 'userMoney';
const MONEY_TRANSACTIONS = 'moneyTransactions';

const LEVEL_GROWTH_RATE = 1.2;
const STREAK_POST_6_GROWTH_RATE = 1.1;
const BOOSTER_BONUS = 1.0;
const INACTIVITY_DAYS_FOR_BOOSTER = 5;
const DAILY_XP_CAP = 10;
const WEEKLY_XP_CAP = 7;
const DAILY_MONEY_CAP = 10;

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

function getXpToNextLevel(level: number) {
  return Math.round(100 * Math.pow(LEVEL_GROWTH_RATE, Math.max(0, level - 1)));
}

function getStreakMultiplier(streak: number) {
  if (streak <= 1) return 1.0;
  if (streak === 2) return 1.25;
  if (streak === 3) return 1.5;
  if (streak === 4) return 1.75;
  if (streak === 5) return 2.0;
  if (streak === 6) return 2.5;

  return Number(
    (2.5 * Math.pow(STREAK_POST_6_GROWTH_RATE, streak - 6)).toFixed(2)
  );
}

function getDateKey(isoOrDate: string | Date) {
  const date = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  return date.toISOString().slice(0, 10);
}

function getWeekKey(isoOrDate: string | Date) {
  const date = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getDayDiff(fromIso: string, toIso: string) {
  const from = new Date(getDateKey(fromIso));
  const to = new Date(getDateKey(toIso));
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

function applyXpToLevel(stats: UserStatsDoc, xpGained: number): UserStatsDoc {
  let totalXp = stats.totalXp + xpGained;
  let level = stats.level;
  let currentLevelXp = stats.currentLevelXp + xpGained;
  let xpToNextLevel = stats.xpToNextLevel;

  while (currentLevelXp >= xpToNextLevel) {
    currentLevelXp -= xpToNextLevel;
    level += 1;
    xpToNextLevel = getXpToNextLevel(level);
  }

  return {
    ...stats,
    totalXp,
    level,
    currentLevelXp,
    xpToNextLevel,
  };
}

function normalizeCapCounters(stats: UserStatsDoc, now: string): UserStatsDoc {
  const todayKey = getDateKey(now);
  const weekKey = getWeekKey(now);

  return {
    ...stats,
    dailyXpDate: stats.dailyXpDate === todayKey ? stats.dailyXpDate : todayKey,
    dailyXpCompletions:
      stats.dailyXpDate === todayKey ? stats.dailyXpCompletions : 0,
    weeklyXpWeekKey:
      stats.weeklyXpWeekKey === weekKey ? stats.weeklyXpWeekKey : weekKey,
    weeklyXpCompletions:
      stats.weeklyXpWeekKey === weekKey ? stats.weeklyXpCompletions : 0,
  };
}

function applyProgressEvent(stats: UserStatsDoc, now: string): UserStatsDoc {
  let nextStreak = 1;

  if (stats.lastProgressAt) {
    const diff = getDayDiff(stats.lastProgressAt, now);

    if (diff <= 0) {
      nextStreak = Math.max(1, stats.currentStreak);
    } else if (diff === 1) {
      nextStreak = Math.max(1, stats.currentStreak + 1);
    } else {
      nextStreak = 1;
    }
  }

  const boosterShouldEnd = stats.boosterActive && nextStreak >= 3;

  return {
    ...stats,
    currentStreak: nextStreak,
    longestStreak: Math.max(stats.longestStreak, nextStreak),
    lastProgressAt: now,
    boosterActive: boosterShouldEnd ? false : stats.boosterActive,
    boosterBonus: boosterShouldEnd ? 0 : stats.boosterBonus,
    boosterActivatedAt: boosterShouldEnd ? null : stats.boosterActivatedAt,
  };
}

function getCompletionMultiplier(stats: UserStatsDoc) {
  return getStreakMultiplier(stats.currentStreak) + (stats.boosterActive ? stats.boosterBonus : 0);
}

function isXpEligibleForCompletion(
  repetition: HabitDoc['repetition'],
  stats: UserStatsDoc
) {
  if (repetition === 'Weekly') {
    return stats.weeklyXpCompletions < WEEKLY_XP_CAP;
  }

  return stats.dailyXpCompletions < DAILY_XP_CAP;
}

function incrementCapCounter(
  repetition: HabitDoc['repetition'],
  stats: UserStatsDoc
): UserStatsDoc {
  if (repetition === 'Weekly') {
    return {
      ...stats,
      weeklyXpCompletions: stats.weeklyXpCompletions + 1,
    };
  }

  return {
    ...stats,
    dailyXpCompletions: stats.dailyXpCompletions + 1,
  };
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

function getFollowingResetAt(
  repetition: HabitDoc['repetition'],
  currentNextResetAt: string | null
): string | null {
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

function getCycleResultXp(result: 'completed' | 'partial' | 'missed', baseXp: number) {
  if (result === 'completed') return baseXp;
  if (result === 'partial') return Math.floor(baseXp / 2);
  return 0;
}

function createDefaultUserStats(userId: string): UserStatsDoc {
  return {
    userId,
    totalXp: 0,
    level: 1,
    currentLevelXp: 0,
    xpToNextLevel: 100,
    currentStreak: 0,
    longestStreak: 0,
    lastProgressAt: null,
    boosterActive: false,
    boosterBonus: 0,
    boosterActivatedAt: null,
    boosterNotifiedAt: null,
    dailyXpDate: null,
    dailyXpCompletions: 0,
    weeklyXpWeekKey: null,
    weeklyXpCompletions: 0,
    updatedAt: nowIso(),
  };
}

function createDefaultUserMoney(userId: string): UserMoneyDoc {
  return {
    userId,
    balance: 0,
    totalEarned: 0,
    totalSpent: 0,
    dailyMoneyDate: null,
    dailyMoneyTasks: 0,
    updatedAt: nowIso(),
  };
}

function normalizeMoneyCounters(money: UserMoneyDoc, now: string): UserMoneyDoc {
  const todayKey = getDateKey(now);

  return {
    ...money,
    dailyMoneyDate: money.dailyMoneyDate === todayKey ? money.dailyMoneyDate : todayKey,
    dailyMoneyTasks: money.dailyMoneyDate === todayKey ? money.dailyMoneyTasks : 0,
  };
}

function isMoneyEligibleForTask(money: UserMoneyDoc) {
  return money.dailyMoneyTasks < DAILY_MONEY_CAP;
}

function incrementMoneyTaskCounter(money: UserMoneyDoc): UserMoneyDoc {
  return {
    ...money,
    dailyMoneyTasks: money.dailyMoneyTasks + 1,
  };
}

function getMoneyForCompletion(repetition: HabitDoc['repetition']) {
  if (repetition === 'Weekly') return 15;
  if (repetition === 'One Time') return 20;
  return 10;
}

export async function ensureUserStats(userId?: string) {
  const uid = userId ?? getCurrentUserId();
  const ref = doc(db, USER_STATS, uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    await setDoc(ref, createDefaultUserStats(uid));
  }
}

export async function ensureUserMoney(userId?: string) {
  const uid = userId ?? getCurrentUserId();
  const ref = doc(db, USER_MONEY, uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    await setDoc(ref, createDefaultUserMoney(uid));
  }
}

export async function checkAndActivateMotivationalBooster(userId?: string) {
  const uid = userId ?? getCurrentUserId();
  await ensureUserStats(uid);

  const ref = doc(db, USER_STATS, uid);

  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const stats = snap.exists()
      ? (snap.data() as UserStatsDoc)
      : createDefaultUserStats(uid);

    if (!stats.lastProgressAt) {
      return false;
    }

    const diff = getDayDiff(stats.lastProgressAt, nowIso());

    if (diff < INACTIVITY_DAYS_FOR_BOOSTER || stats.boosterActive) {
      return false;
    }

    const activatedAt = nowIso();

    tx.set(
      ref,
      {
        boosterActive: true,
        boosterBonus: BOOSTER_BONUS,
        boosterActivatedAt: activatedAt,
        boosterNotifiedAt: activatedAt,
        updatedAt: activatedAt,
      },
      { merge: true }
    );

    return true;
  });
}

export function subscribeToUserStats(
  onData: (stats: UserStatsDoc | null) => void,
  onError?: (error: Error) => void
) {
  const userId = getCurrentUserId();
  const ref = doc(db, USER_STATS, userId);

  return onSnapshot(
    ref,
    (snap) => {
      onData(snap.exists() ? (snap.data() as UserStatsDoc) : null);
    },
    (error) => onError?.(error)
  );
}

export async function createHabit(input: CreateHabitInput) {
  const userId = getCurrentUserId();
  await ensureUserStats(userId);
  await ensureUserMoney(userId);

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

    xpBase: cleanTarget * 10,
    xpPoolMax: cleanTarget * 100,
    xpPoolRemaining: cleanTarget * 100,
    xpEarnedThisCycle: 0,
    completedThisCycle: false,

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

export async function updateHabitProgress(
  habitId: string,
  nextCount: number,
  options: UpdateProgressOptions = {}
) {
  const userId = getCurrentUserId();
  const ref = doc(db, HABITS, habitId);
  const statsRef = doc(db, USER_STATS, userId);
  const moneyRef = doc(db, USER_MONEY, userId);
  const moneyTransactionRef = doc(collection(db, MONEY_TRANSACTIONS));

  await runTransaction(db, async (tx) => {
    const [snap, statsSnap, moneySnap] = await Promise.all([
      tx.get(ref),
      tx.get(statsRef),
      tx.get(moneyRef),
    ]);

    if (!snap.exists()) {
      throw new Error('Habit not found.');
    }

    const habit = snap.data() as HabitDoc;
    if (habit.userId !== userId) {
      throw new Error('Unauthorized habit update.');
    }

    const baseStats = statsSnap.exists()
      ? (statsSnap.data() as UserStatsDoc)
      : createDefaultUserStats(userId);

    const baseMoney = moneySnap.exists()
      ? (moneySnap.data() as UserMoneyDoc)
      : createDefaultUserMoney(userId);

    const now = nowIso();
    const clamped = clampCount(nextCount, habit.targetCount);
    const becameCompleted =
      clamped >= habit.targetCount && habit.currentCount < habit.targetCount;

    let nextStats = normalizeCapCounters(baseStats, now);
    nextStats = applyProgressEvent(nextStats, now);

    let nextMoney = normalizeMoneyCounters(baseMoney, now);

    let xpAwarded = 0;
    let coinsAwarded = 0;

    if (options.awardXp !== false && becameCompleted) {
      const eligible = isXpEligibleForCompletion(habit.repetition, nextStats);

      if (eligible) {
        const multiplier = getCompletionMultiplier(nextStats);
        xpAwarded = Math.round(habit.xp * multiplier);
        nextStats = incrementCapCounter(habit.repetition, nextStats);
        nextStats = applyXpToLevel(nextStats, xpAwarded);
      }

      if (isMoneyEligibleForTask(nextMoney)) {
        coinsAwarded = getMoneyForCompletion(habit.repetition);
        nextMoney = incrementMoneyTaskCounter(nextMoney);
      }
    }

    tx.update(ref, {
      currentCount: clamped,
      lastCompletedAt: becameCompleted ? now : habit.lastCompletedAt,
      currentStreak: nextStats.currentStreak,
      longestStreak: nextStats.longestStreak,
    });

    tx.set(
      statsRef,
      {
        ...nextStats,
        updatedAt: now,
      },
      { merge: true }
    );

    tx.set(
      moneyRef,
      {
        ...nextMoney,
        balance: nextMoney.balance + coinsAwarded,
        totalEarned: nextMoney.totalEarned + coinsAwarded,
        updatedAt: now,
      },
      { merge: true }
    );

    if (coinsAwarded > 0) {
      const moneyTransaction: MoneyTransactionDoc = {
        id: moneyTransactionRef.id,
        userId,
        type: 'earn',
        amount: coinsAwarded,
        reason: `Completed habit: ${habit.title}`,
        sourceId: habit.id,
        createdAt: now,
      };

      tx.set(moneyTransactionRef, moneyTransaction);
    }
  });
}

export async function toggleHabitComplete(habitId: string) {
  const userId = getCurrentUserId();
  const ref = doc(db, HABITS, habitId);
  const statsRef = doc(db, USER_STATS, userId);
  const moneyRef = doc(db, USER_MONEY, userId);
  const moneyTransactionRef = doc(collection(db, MONEY_TRANSACTIONS));

  await runTransaction(db, async (tx) => {
    const [snap, statsSnap, moneySnap] = await Promise.all([
      tx.get(ref),
      tx.get(statsRef),
      tx.get(moneyRef),
    ]);

    if (!snap.exists()) {
      throw new Error('Habit not found.');
    }

    const habit = snap.data() as HabitDoc;
    if (habit.userId !== userId) {
      throw new Error('Unauthorized habit update.');
    }

    const baseStats = statsSnap.exists()
      ? (statsSnap.data() as UserStatsDoc)
      : createDefaultUserStats(userId);

    const baseMoney = moneySnap.exists()
      ? (moneySnap.data() as UserMoneyDoc)
      : createDefaultUserMoney(userId);

    const now = nowIso();
    const isCompleted = habit.currentCount >= habit.targetCount;
    const nextCount = isCompleted ? 0 : habit.targetCount;

    let nextStats = normalizeCapCounters(baseStats, now);
    nextStats = applyProgressEvent(nextStats, now);

    let nextMoney = normalizeMoneyCounters(baseMoney, now);

    let xpAwarded = 0;
    let coinsAwarded = 0;

    if (!isCompleted) {
      const eligible = isXpEligibleForCompletion(habit.repetition, nextStats);

      if (eligible) {
        const multiplier = getCompletionMultiplier(nextStats);
        xpAwarded = Math.round(habit.xp * multiplier);
        nextStats = incrementCapCounter(habit.repetition, nextStats);
        nextStats = applyXpToLevel(nextStats, xpAwarded);
      }

      if (isMoneyEligibleForTask(nextMoney)) {
        coinsAwarded = getMoneyForCompletion(habit.repetition);
        nextMoney = incrementMoneyTaskCounter(nextMoney);
      }
    }

    tx.update(ref, {
      currentCount: nextCount,
      lastCompletedAt: !isCompleted ? now : habit.lastCompletedAt,
      currentStreak: nextStats.currentStreak,
      longestStreak: nextStats.longestStreak,
    });

    tx.set(
      statsRef,
      {
        ...nextStats,
        updatedAt: now,
      },
      { merge: true }
    );

    tx.set(
      moneyRef,
      {
        ...nextMoney,
        balance: nextMoney.balance + coinsAwarded,
        totalEarned: nextMoney.totalEarned + coinsAwarded,
        updatedAt: now,
      },
      { merge: true }
    );

    if (coinsAwarded > 0) {
      const moneyTransaction: MoneyTransactionDoc = {
        id: moneyTransactionRef.id,
        userId,
        type: 'earn',
        amount: coinsAwarded,
        reason: `Completed habit: ${habit.title}`,
        sourceId: habit.id,
        createdAt: now,
      };

      tx.set(moneyTransactionRef, moneyTransaction);
    }
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
  await ensureUserMoney(userId);

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

    const xpEarned = getCycleResultXp(result, habit.xp);
    const nextCurrentStreak = result === 'completed' ? habit.currentStreak + 1 : 0;
    const nextLongestStreak = Math.max(habit.longestStreak, nextCurrentStreak);

    const historyRef = doc(collection(db, HABIT_HISTORY));
    const statsRef = doc(db, USER_STATS, userId);
    const habitRef = doc(db, HABITS, habit.id);

    await runTransaction(db, async (tx) => {
      const statsSnap = await tx.get(statsRef);
      const currentStats = statsSnap.exists()
        ? (statsSnap.data() as UserStatsDoc)
        : createDefaultUserStats(userId);

      const updatedStats = applyXpToLevel(
        {
          ...currentStats,
          longestStreak: Math.max(currentStats.longestStreak, nextLongestStreak),
        },
        xpEarned
      );

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
          ...updatedStats,
          longestStreak: Math.max(updatedStats.longestStreak, nextLongestStreak),
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

export async function decrementHabitProgressFast(habitId: string, nextCount: number) {
  const userId = getCurrentUserId();
  const ref = doc(db, HABITS, habitId);

  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error('Habit not found.');
  }

  const habit = snap.data() as HabitDoc;
  if (habit.userId !== userId) {
    throw new Error('Unauthorized habit update.');
  }

  const clamped = Math.max(0, Math.min(nextCount, Math.max(1, habit.targetCount)));

  await updateDoc(ref, {
    currentCount: clamped,
  });
}