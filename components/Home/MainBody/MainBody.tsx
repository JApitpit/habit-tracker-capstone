import React, { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
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

import { useHabits } from '../../../Backend/hooks/useHabits';
import { createHabit } from '../../../Backend/services/habitService';
import type { HabitDoc } from '../../../Backend/types/tasks';
import { COLORS } from '../../../styles/globalStyles';

export type Habit = HabitDoc;

export default function MainBody() {
  const [activeTab, setActiveTab] = useState('Dailies');
  const bottomSheetRef = useRef<BottomSheet>(null);

  const { habits, loading, error } = useHabits();

  const [selectedRecommendationHabit, setSelectedRecommendationHabit] =
    useState<RecommendationHabit | null>(null);
  const [recommendationPromptVisible, setRecommendationPromptVisible] =
    useState(false);

  const habitsNeedingRecommendation: RecommendationHabit[] = useMemo(
    () =>
      habits
        .filter((habit) => habit.currentCount < habit.targetCount)
        .map((habit) => ({
          ...habit,
          reason:
            habit.currentCount === 0
              ? 'This habit has not been completed yet.'
              : 'This habit is still behind its target and may need support.',
        })),
    [habits]
  );

  const handleCreateHabit = async (newHabit: {
    id: string;
    title: string;
    subtitle?: string;
    currentCount: number;
    targetCount: number;
    repetition: 'Daily' | 'Weekly' | 'One Time';
    reminderEnabled: boolean;
    reminderTime?: string;
    notificationId?: string | null;
  }) => {
    await createHabit({
      title: newHabit.title,
      subtitle: newHabit.subtitle,
      targetCount: newHabit.targetCount,
      repetition: newHabit.repetition,
      reminderEnabled: newHabit.reminderEnabled,
      reminderTime: newHabit.reminderTime,
      notificationId: newHabit.notificationId,
    });
  };

  const openRecommendationPrompt = (habit: RecommendationHabit) => {
    setSelectedRecommendationHabit(habit);
    setRecommendationPromptVisible(true);
  };

  const closeRecommendationPrompt = () => {
    setRecommendationPromptVisible(false);
    setSelectedRecommendationHabit(null);
  };

  const openHabitSheet = () => {
    bottomSheetRef.current?.snapToIndex(1);
  };

  const closeHabitSheet = () => {
    bottomSheetRef.current?.close();
  };

  const renderActivePage = () => {
    if (loading) {
      return <ActivityIndicator size="large" color={COLORS.teal} />;
    }

    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }

    switch (activeTab) {
      case 'Habits':
        return <HabitsPage habits={habits} />;
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
        onAccept={() => {
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
    justifyContent: 'center',
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
  },
});