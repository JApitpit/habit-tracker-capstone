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

  xpBase: number;
  xpPoolMax: number;
  xpPoolRemaining: number;
  xpEarnedThisCycle: number;
  completedThisCycle: boolean;

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

export type UpdateProgressOptions = {
  awardXp?: boolean;
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
  currentLevelXp: number;
  xpToNextLevel: number;

  currentStreak: number;
  longestStreak: number;

  lastProgressAt: string | null;

  boosterActive: boolean;
  boosterBonus: number;
  boosterActivatedAt: string | null;
  boosterNotifiedAt: string | null;

  dailyXpDate: string | null;
  dailyXpCompletions: number;

  weeklyXpWeekKey: string | null;
  weeklyXpCompletions: number;

  updatedAt: string;
};