import React, { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import HabitItem from '../TabItems/HabitItems';
import TaskDetailsPrompt from '../TaskDetailsPrompt';
import type { Habit } from '../MainBody';

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
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
};

export default function HabitsPage({ habits, setHabits }: HabitsPageProps) {
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const detailsSheetRef = useRef<BottomSheet>(null);

  const selectedHabit = useMemo(
    () => habits.find((habit) => habit.id === selectedHabitId) ?? null,
    [habits, selectedHabitId]
  );

  const increment = (id: string) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? { ...h, currentCount: Math.min(h.currentCount + 1, h.targetCount) }
          : h
      )
    );
  };

  const decrement = (id: string) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? { ...h, currentCount: Math.max(h.currentCount - 1, 0) }
          : h
      )
    );
  };

  const toggleComplete = (id: string) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              currentCount: h.currentCount >= h.targetCount ? 0 : h.targetCount,
            }
          : h
      )
    );
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

  const handleSaveHabit = (updated: HabitSaveData) => {
    if (!selectedHabitId) return;

    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === selectedHabitId
          ? {
              ...habit,
              title: updated.title,
              subtitle: updated.subtitle,
              repetition: updated.repetition ?? habit.repetition,
              targetCount: updated.targetCount,
              currentCount: Math.min(updated.currentCount, updated.targetCount),
              reminderEnabled: updated.reminderEnabled,
              reminderTime: updated.reminderEnabled
                ? updated.reminderTime || ''
                : '',
              notificationId: updated.reminderEnabled
                ? updated.notificationId ?? null
                : null,
            }
          : habit
      )
    );
  };

  const handleDeleteHabit = () => {
    if (!selectedHabitId) return;

    setHabits((prev) => prev.filter((habit) => habit.id !== selectedHabitId));
    detailsSheetRef.current?.close();
    setSelectedHabitId(null);
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
            currentCount={habit.currentCount}
            targetCount={habit.targetCount}
            onIncrement={() => increment(habit.id)}
            onDecrement={() => decrement(habit.id)}
            onToggleComplete={() => toggleComplete(habit.id)}
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