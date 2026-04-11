import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';

import HabitItem from '../TabItems/HabitItems';
import TaskDetailsPrompt from '../TaskDetailsPrompt';
import type { Habit } from '../MainBody';
import {
  decrementHabitProgressFast,
  deleteHabit,
  toggleHabitComplete,
  updateHabitDetails,
  updateHabitProgress,
} from '../../../../Backend/services/habitService';

type HabitSaveData = {
  title: string;
  subtitle: string;
  repetition?: 'Daily' | 'Weekly' | 'One Time';
  dueDate?: string;
  progress: number;
  targetCount: number;
  currentCount: number;
  reminderEnabled: boolean;
  reminderTime?: string;
  notificationId?: string | null;
};

type HabitsPageProps = {
  habits: Habit[];
};

export default function HabitsPage({ habits }: HabitsPageProps) {
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [busyHabitId, setBusyHabitId] = useState<string | null>(null);
  const [localCounts, setLocalCounts] = useState<Record<string, number>>({});
  const [xpPopupByHabit, setXpPopupByHabit] = useState<Record<string, number>>({});
  const detailsSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    setLocalCounts((prev) => {
      const next: Record<string, number> = {};

      for (const habit of habits) {
        next[habit.id] = prev[habit.id] ?? habit.currentCount;
      }

      return next;
    });
  }, [habits]);

  const getDisplayedCount = (habit: Habit) => {
    return localCounts[habit.id] ?? habit.currentCount;
  };

  const selectedHabit = useMemo(() => {
    const baseHabit = habits.find((habit) => habit.id === selectedHabitId) ?? null;
    if (!baseHabit) return null;

    return {
      ...baseHabit,
      currentCount: getDisplayedCount(baseHabit),
    };
  }, [habits, selectedHabitId, localCounts]);

  const getXpLabel = (habit: Habit) => {
    const xpBase =
      typeof (habit as any).xpBase === 'number'
        ? (habit as any).xpBase
        : typeof (habit as any).xp === 'number'
        ? (habit as any).xp
        : 0;

    return `+${xpBase} XP`;
  };

  const showXpPopup = (habitId: string, amount: number) => {
    setXpPopupByHabit((prev) => ({ ...prev, [habitId]: amount }));

    setTimeout(() => {
      setXpPopupByHabit((prev) => ({ ...prev, [habitId]: 0 }));
    }, 900);
  };

  const increment = async (habit: Habit) => {
    if (busyHabitId === habit.id) return;

    const displayedCount = getDisplayedCount(habit);
    const nextCount = Math.min(displayedCount + 1, habit.targetCount);
    const willComplete =
      displayedCount < habit.targetCount && nextCount >= habit.targetCount;

    const xpBase =
      typeof (habit as any).xpBase === 'number'
        ? (habit as any).xpBase
        : typeof (habit as any).xp === 'number'
        ? (habit as any).xp
        : 0;

    setLocalCounts((prev) => ({
      ...prev,
      [habit.id]: nextCount,
    }));

    try {
      setBusyHabitId(habit.id);
      await updateHabitProgress(habit.id, nextCount, {
        awardXp: true,
      });

      if (willComplete && xpBase > 0) {
        showXpPopup(habit.id, xpBase);
      }
    } catch (error) {
      console.log('Increment failed:', error);
      setLocalCounts((prev) => ({
        ...prev,
        [habit.id]: habit.currentCount,
      }));
    } finally {
      setBusyHabitId(null);
    }
  };

  const decrement = async (habit: Habit) => {
    if (busyHabitId === habit.id) return;

    const displayedCount = getDisplayedCount(habit);
    const nextCount = Math.max(displayedCount - 1, 0);

    setLocalCounts((prev) => ({
      ...prev,
      [habit.id]: nextCount,
    }));

    try {
      setBusyHabitId(habit.id);
      await decrementHabitProgressFast(habit.id, nextCount);
    } catch (error) {
      console.log('Decrement failed:', error);
      setLocalCounts((prev) => ({
        ...prev,
        [habit.id]: habit.currentCount,
      }));
    } finally {
      setBusyHabitId(null);
    }
  };

  const toggleComplete = async (habit: Habit) => {
    if (busyHabitId === habit.id) return;

    const displayedCount = getDisplayedCount(habit);
    const isCompleted = displayedCount >= habit.targetCount;
    const nextCount = isCompleted ? 0 : habit.targetCount;

    const xpBase =
      typeof (habit as any).xpBase === 'number'
        ? (habit as any).xpBase
        : typeof (habit as any).xp === 'number'
        ? (habit as any).xp
        : 0;

    setLocalCounts((prev) => ({
      ...prev,
      [habit.id]: nextCount,
    }));

    try {
      setBusyHabitId(habit.id);
      await toggleHabitComplete(habit.id);

      if (!isCompleted && xpBase > 0) {
        showXpPopup(habit.id, xpBase);
      }
    } catch (error) {
      console.log('Toggle complete failed:', error);
      setLocalCounts((prev) => ({
        ...prev,
        [habit.id]: habit.currentCount,
      }));
    } finally {
      setBusyHabitId(null);
    }
  };

  const openDetails = (id: string) => {
    setSelectedHabitId(id);
    requestAnimationFrame(() => {
      detailsSheetRef.current?.snapToIndex(1);
    });
  };

  const closeDetails = () => {
    detailsSheetRef.current?.close();
  };

  const handleSaveHabit = async (updated: HabitSaveData) => {
    if (!selectedHabitId || busyHabitId) return;

    const existingHabit = habits.find((habit) => habit.id === selectedHabitId);
    if (!existingHabit) return;

    const safeCurrentCount = Math.min(updated.currentCount, updated.targetCount);

    setLocalCounts((prev) => ({
      ...prev,
      [selectedHabitId]: safeCurrentCount,
    }));

    try {
      setBusyHabitId(selectedHabitId);

      await updateHabitDetails(selectedHabitId, {
        title: updated.title,
        subtitle: updated.subtitle,
        repetition: updated.repetition,
        targetCount: updated.targetCount,
        reminderEnabled: updated.reminderEnabled,
        reminderTime: updated.reminderEnabled ? updated.reminderTime || '' : '',
        notificationId: updated.reminderEnabled
          ? updated.notificationId ?? null
          : null,
      });

      await updateHabitProgress(selectedHabitId, safeCurrentCount, {
        awardXp: false,
      });
    } catch (error) {
      console.log('Save habit failed:', error);
      setLocalCounts((prev) => ({
        ...prev,
        [selectedHabitId]: existingHabit.currentCount,
      }));
    } finally {
      setBusyHabitId(null);
    }
  };

  const handleDeleteHabit = async () => {
    if (!selectedHabitId || busyHabitId) return;

    try {
      setBusyHabitId(selectedHabitId);
      await deleteHabit(selectedHabitId);
      detailsSheetRef.current?.close();
      setSelectedHabitId(null);
      setLocalCounts((prev) => {
        const next = { ...prev };
        delete next[selectedHabitId];
        return next;
      });
    } catch (error) {
      console.log('Delete habit failed:', error);
    } finally {
      setBusyHabitId(null);
    }
  };

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {habits.map((habit) => (
          <HabitItem
            key={habit.id}
            title={habit.title}
            subtitle={habit.subtitle}
            currentCount={getDisplayedCount(habit)}
            targetCount={habit.targetCount}
            disabled={busyHabitId === habit.id}
            xpLabel={getXpLabel(habit)}
            xpGain={xpPopupByHabit[habit.id] ?? 0}
            onIncrement={() => increment(habit)}
            onDecrement={() => decrement(habit)}
            onToggleComplete={() => toggleComplete(habit)}
            onOpenDetails={() => openDetails(habit.id)}
          />
        ))}
      </ScrollView>

      <TaskDetailsPrompt
        ref={detailsSheetRef}
        type="habit"
        title={selectedHabit?.title}
        subtitle={selectedHabit?.subtitle}
        repetition={selectedHabit?.repetition}
        progress={
          selectedHabit
            ? selectedHabit.currentCount / Math.max(selectedHabit.targetCount, 1)
            : 0
        }
        targetCount={selectedHabit?.targetCount ?? 1}
        currentCount={selectedHabit?.currentCount ?? 0}
        reminderEnabled={selectedHabit?.reminderEnabled ?? false}
        reminderTime={selectedHabit?.reminderTime ?? ''}
        notificationId={selectedHabit?.notificationId ?? null}
        onClose={closeDetails}
        onSave={handleSaveHabit}
        onDelete={handleDeleteHabit}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    gap: 14,
    paddingBottom: 120,
  },
});