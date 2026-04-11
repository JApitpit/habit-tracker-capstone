import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import type { HabitDoc } from '../types/tasks';
import {
  assignDailyHabitsForToday,
  checkAndActivateMotivationalBooster,
  processHabitResets,
  subscribeToHabits,
} from '../services/habitService';

async function maybeShowBoosterNotification() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Motivational Booster Active',
      body: "You haven’t logged anything in a few days, here’s a booster.",
      sound: true,
    },
    trigger: null,
  });
}

export function useHabits() {
  const [habits, setHabits] = useState<HabitDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const boot = async () => {
      try {
        await processHabitResets();

        const boosterActivated = await checkAndActivateMotivationalBooster();
        if (boosterActivated) {
          await maybeShowBoosterNotification();
        }

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