import React, { useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import ReminderBar from './ReminderBar';
import Tabs from './Tabs';
import HabitsPage from './Active Tab Pages/HabitsPage';
import DailiesPage from './Active Tab Pages/DailiesPage';
import TodosPage from './Active Tab Pages/TodosPage';
import RewardsPage from './Active Tab Pages/RewardsPage';
import FooterNav from './Footer/Footer';
import CreateHabitSheet from './CreateHabitSheet';

export type Habit = {
  id: string;
  title: string;
  subtitle?: string;
  currentCount: number;
  targetCount: number;
  repetition: 'Daily' | 'Weekly' | 'One Time';
  reminderEnabled: boolean;
  reminderTime?: string;
  notificationId?: string | null;
};

export default function MainBody() {
  const [activeTab, setActiveTab] = useState('Dailies');
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [habits, setHabits] = useState<Habit[]>([
    {
      id: '1',
      title: 'Drink Water',
      subtitle: 'Stay hydrated',
      currentCount: 2,
      targetCount: 5,
      repetition: 'Daily',
      reminderEnabled: true,
      reminderTime: new Date().toISOString(),
      notificationId: null,
    },
    {
      id: '2',
      title: 'Workout',
      subtitle: 'Quick exercise',
      currentCount: 1,
      targetCount: 1,
      repetition: 'Daily',
      reminderEnabled: false,
      reminderTime: '',
      notificationId: null,
    },
    {
      id: '3',
      title: 'Read',
      subtitle: '10 pages',
      currentCount: 3,
      targetCount: 10,
      repetition: 'Weekly',
      reminderEnabled: false,
      reminderTime: '',
      notificationId: null,
    },
  ]);

  const handleCreateHabit = (newHabit: Habit) => {
    setHabits((prev) => [...prev, newHabit]);
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'Habits':
        return <HabitsPage habits={habits} setHabits={setHabits} />;
      case 'Dailies':
        return <DailiesPage />;
      case 'To Do’s':
        return <TodosPage />;
      case 'Rewards':
        return <RewardsPage />;
      default:
        return <DailiesPage />;
    }
  };

  const openHabitSheet = () => {
    bottomSheetRef.current?.snapToIndex(1);
  };

  const closeHabitSheet = () => {
    bottomSheetRef.current?.close();
  };

  return (
    <View style={styles.container}>
      <ReminderBar />
      <Tabs activeTab={activeTab} onTabPress={setActiveTab} />
      <View style={styles.pageContainer}>{renderActivePage()}</View>

      <FooterNav onAddPress={openHabitSheet} />

      <CreateHabitSheet
        ref={bottomSheetRef}
        onClose={closeHabitSheet}
        onCreateHabit={handleCreateHabit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  pageContainer: {
    flex: 1,
    marginTop: 10,
    paddingBottom: 125,
  },
});