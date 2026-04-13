export type UserMoneyDoc = {
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  dailyMoneyDate: string | null;
  dailyMoneyTasks: number;
  updatedAt: string;
};

export type MoneyTransactionDoc = {
  id: string;
  userId: string;
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  sourceId?: string | null;
  createdAt: string;
};