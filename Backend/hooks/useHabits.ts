import { useEffect, useState } from 'react';
import type { HabitDoc } from '../types/tasks';
import {
  processHabitResets,
  assignDailyHabitsForToday,
  subscribeToHabits,
} from '../services/habitService';

export function useHabits() {
  const [habits, setHabits] = useState<HabitDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const boot = async () => {
      try {
        await processHabitResets();
        await assignDailyHabitsForToday();

        unsubscribe = subscribeToHabits(
          (data) => {
            setHabits(data);
            setLoading(false);
          },
          (err) => {
            setError(err.message);
            setLoading(false);
          }
        );
      } catch (err: any) {
        setError(err.message ?? 'Failed to load habits.');
        setLoading(false);
      }
    };

    boot();

    return () => {
      unsubscribe?.();
    };
  }, []);

  return {
    habits,
    setHabits,
    loading,
    error,
  };
}