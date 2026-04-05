import React, { useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import ReminderBar from './ReminderBar';
import Tabs from './Tabs';
import HabitsPage from './Active Tab Pages/HabitsPage';
import DailiesPage from './Active Tab Pages/DailiesPage';
import TodosPage from './Active Tab Pages/TodosPage';
import RewardsPage from './Active Tab Pages/RewardsPage';
import RecommendationsPage from './Active Tab Pages/RecommendationsPage';
import FooterNav from './Footer/Footer';
import CreateHabitSheet from './CreateHabitSheet';
import RecommendationPrompt, { RecommendationHabit } from './RecommendationPrompt';

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

  const [selectedRecommendationHabit, setSelectedRecommendationHabit] =
    useState<RecommendationHabit | null>(null);
  const [recommendationPromptVisible, setRecommendationPromptVisible] =
    useState(false);

  const handleCreateHabit = (newHabit: Habit) => {
    setHabits((prev) => [...prev, newHabit]);
  };

  const habitsNeedingRecommendation: RecommendationHabit[] = habits
    .filter((habit) => habit.currentCount < habit.targetCount)
    .map((habit) => ({
      ...habit,
      completedCount: habit.currentCount,
      missedCount: Math.max(habit.targetCount - habit.currentCount, 0),
      reason:
        habit.currentCount === 0
          ? 'This habit has not been completed yet.'
          : 'This habit is still behind its target and may need support.',
    }));

  const openRecommendationPrompt = (habit: RecommendationHabit) => {
    setSelectedRecommendationHabit(habit);
    setRecommendationPromptVisible(true);
  };

  const closeRecommendationPrompt = () => {
    setRecommendationPromptVisible(false);
    setSelectedRecommendationHabit(null);
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
      case 'Recommendations':
     return (
        <RecommendationsPage
          habits={habitsNeedingRecommendation}
          onHabitPress={openRecommendationPrompt}
          onExitPress={() => setActiveTab('Dailies')}
        />
           );
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

      {activeTab !== 'Recommendations' && (
        <Tabs activeTab={activeTab} onTabPress={setActiveTab} />
      )}

      <View style={styles.pageContainer}>{renderActivePage()}</View>

      <FooterNav
        onAddPress={openHabitSheet}
        onRecommendationsPress={() => setActiveTab('Recommendations')}
        recommendationCount={habitsNeedingRecommendation.length}
      />

      <CreateHabitSheet
        ref={bottomSheetRef}
        onClose={closeHabitSheet}
        onCreateHabit={handleCreateHabit}
      />

      <RecommendationPrompt
        visible={recommendationPromptVisible}
        habit={selectedRecommendationHabit}
        onClose={closeRecommendationPrompt}
        onReject={closeRecommendationPrompt}
        onAccept={(habit) => {
         closeRecommendationPrompt();
  }}
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