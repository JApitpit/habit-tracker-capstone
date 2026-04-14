export type UserHpDoc = {
  userId: string;
  currentHp: number;
  maxHp: number;
  updatedAt: string;
};

export type HpEventType = 'loss_missed' | 'loss_partial' | 'regen_completion' | 'regen_levelup';

export type HpEventDoc = {
  id: string;
  userId: string;
  type: HpEventType;
  amount: number;
  reason: string;
  sourceId?: string; // habitId that caused the event
  createdAt: string;
};