import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from '../../firebase';
import type { UserHpDoc, HpEventDoc } from '../types/health';

// ─── Collections ─────────────────────────────────────────
const USER_HP = 'userHp';
const HP_EVENTS = 'hpEvents';

// ─── Constants ───────────────────────────────────────────
const BASE_HP = 100;
const HP_GROWTH_RATE = 1.2;
const HP_LOSS_ON_MISS = 20;
const HP_LOSS_ON_PARTIAL = 10;
const HP_REGEN_ON_COMPLETE = 10;

// ─── Helpers ─────────────────────────────────────────────
function getCurrentUserId(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('No authenticated user.');
  return uid;
}

export function getMaxHp(level: number): number {
  return Math.round(BASE_HP * Math.pow(HP_GROWTH_RATE, level - 1));
}

function createDefaultUserHp(userId: string, level = 1): UserHpDoc {
  const maxHp = getMaxHp(level);
  return {
    userId,
    currentHp: maxHp,
    maxHp,
    updatedAt: new Date().toISOString(),
  };
}

// ─── Ensure HP doc exists ─────────────────────────────────
export async function ensureUserHp(userId?: string, level = 1) {
  const uid = userId ?? getCurrentUserId();
  const ref = doc(db, USER_HP, uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, createDefaultUserHp(uid, level));
  }
}

// ─── Apply HP loss ────────────────────────────────────────
export async function applyHpLoss(
  result: 'missed' | 'partial',
  habitId: string,
  habitTitle: string,
  userId?: string
) {
  const uid = userId ?? getCurrentUserId();
  const ref = doc(db, USER_HP, uid);
  const eventRef = doc(collection(db, HP_EVENTS));

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const data: UserHpDoc = snap.exists()
      ? (snap.data() as UserHpDoc)
      : createDefaultUserHp(uid);

    const damage = result === 'missed' ? HP_LOSS_ON_MISS : HP_LOSS_ON_PARTIAL;
    const newHp = Math.max(0, data.currentHp - damage);
    const now = new Date().toISOString();

    const updatedHp: UserHpDoc = {
      ...data,
      currentHp: newHp,
      updatedAt: now,
    };

    tx.set(ref, updatedHp);

    const event: HpEventDoc = {
      id: eventRef.id,
      userId: uid,
      type: result === 'missed' ? 'loss_missed' : 'loss_partial',
      amount: damage,
      reason: `${result === 'missed' ? 'Missed' : 'Partial'} habit: ${habitTitle}`,
      sourceId: habitId,
      createdAt: now,
    };

    tx.set(eventRef, event);
  });
}

// ─── Apply HP regen ───────────────────────────────────────
export async function applyHpRegen(
  habitId: string,
  habitTitle: string,
  userId?: string
) {
  const uid = userId ?? getCurrentUserId();
  const ref = doc(db, USER_HP, uid);
  const eventRef = doc(collection(db, HP_EVENTS));

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const data: UserHpDoc = snap.exists()
      ? (snap.data() as UserHpDoc)
      : createDefaultUserHp(uid);

    const newHp = Math.min(data.maxHp, data.currentHp + HP_REGEN_ON_COMPLETE);
    const now = new Date().toISOString();

    const updatedHp: UserHpDoc = {
      ...data,
      currentHp: newHp,
      updatedAt: now,
    };

    tx.set(ref, updatedHp);

    const event: HpEventDoc = {
      id: eventRef.id,
      userId: uid,
      type: 'regen_completion',
      amount: HP_REGEN_ON_COMPLETE,
      reason: `Completed habit: ${habitTitle}`,
      sourceId: habitId,
      createdAt: now,
    };

    tx.set(eventRef, event);
  });
}

// ─── Subscribe to HP ──────────────────────────────────────
export function subscribeToHp(
  onData: (hp: UserHpDoc) => void,
  onError?: (error: Error) => void
) {
  const uid = getCurrentUserId();
  const ref = doc(db, USER_HP, uid);

  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as UserHpDoc);
      }
    },
    (error) => onError?.(error)
  );
}