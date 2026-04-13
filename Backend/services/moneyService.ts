import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  setDoc,
} from 'firebase/firestore';
import { db, auth } from '../../firebase';
import type { MoneyTransactionDoc, UserMoneyDoc } from '../types/money';

const USER_MONEY = 'userMoney';
const MONEY_TRANSACTIONS = 'moneyTransactions';

function nowIso() {
  return new Date().toISOString();
}

function getCurrentUserId(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('No authenticated user.');
  }
  return uid;
}

export function createDefaultUserMoney(userId: string): UserMoneyDoc {
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

export async function ensureUserMoney(userId?: string) {
  const uid = userId ?? getCurrentUserId();
  const ref = doc(db, USER_MONEY, uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    await setDoc(ref, createDefaultUserMoney(uid));
  }
}

export function subscribeToUserMoney(
  onData: (money: UserMoneyDoc | null) => void,
  onError?: (error: Error) => void
) {
  const userId = getCurrentUserId();
  const ref = doc(db, USER_MONEY, userId);

  return onSnapshot(
    ref,
    (snap) => {
      onData(snap.exists() ? (snap.data() as UserMoneyDoc) : null);
    },
    (error) => onError?.(error)
  );
}

export async function spendMoney(amount: number, reason: string, sourceId?: string) {
  const userId = getCurrentUserId();
  await ensureUserMoney(userId);

  const moneyRef = doc(db, USER_MONEY, userId);
  const transactionRef = doc(collection(db, MONEY_TRANSACTIONS));

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(moneyRef);

    const money = snap.exists()
      ? (snap.data() as UserMoneyDoc)
      : createDefaultUserMoney(userId);

    if (money.balance < amount) {
      throw new Error('Not enough money.');
    }

    const now = nowIso();

    tx.set(
      moneyRef,
      {
        balance: money.balance - amount,
        totalSpent: money.totalSpent + amount,
        updatedAt: now,
      },
      { merge: true }
    );

    const transaction: MoneyTransactionDoc = {
      id: transactionRef.id,
      userId,
      type: 'spend',
      amount,
      reason,
      sourceId: sourceId ?? null,
      createdAt: now,
    };

    tx.set(transactionRef, transaction);
  });
}