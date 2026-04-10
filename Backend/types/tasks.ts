export type Repetition = 'Daily' | 'Weekly' | 'One Time';

export type TaskType = 'habit' | 'todo';

export type CycleResult = 'completed' | 'partial' | 'missed';

export type HabitDoc = {
  id: string;
  userId: string;

  title: string;
  subtitle: string;

  currentCount: number;
  targetCount: number;
  repetition: Repetition;

  reminderEnabled: boolean;
  reminderTime: string;
  notificationId: string | null;

  createdAt: string;
  resetAnchorDate: string;
  nextResetAt: string | null;
  lastCompletedAt: string | null;

  completionCount: number;
  partialCount: number;
  missedCount: number;

  currentStreak: number;
  longestStreak: number;

  xp: number;
  bonusXpEligible: boolean;

  archived: boolean;
};

export type CreateHabitInput = {
  title: string;
  subtitle?: string;
  targetCount: number;
  repetition: Repetition;
  reminderEnabled: boolean;
  reminderTime?: string;
  notificationId?: string | null;
};

export type UpdateHabitInput = {
  title?: string;
  subtitle?: string;
  targetCount?: number;
  repetition?: Repetition;
  reminderEnabled?: boolean;
  reminderTime?: string;
  notificationId?: string | null;
  archived?: boolean;
};

export type HabitHistoryDoc = {
  id: string;
  userId: string;
  habitId: string;

  cycleStart: string;
  cycleEnd: string;
  result: CycleResult;

  finalCount: number;
  targetCount: number;

  xpEarned: number;
  wasDaily: boolean;

  createdAt: string;
};

export type DailyAssignmentDoc = {
  id: string;
  userId: string;
  dateKey: string;
  habitId: string;
  createdAt: string;
};

export type UserStatsDoc = {
  userId: string;
  totalXp: number;
  level: number;
  longestStreak: number;
  updatedAt: string;
};