import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import ReminderBar from './ReminderBar';
import Tabs from './Tabs';
import HabitsPage from './Active Tab Pages/HabitsPage';
import DailiesPage from './Active Tab Pages/DailiesPage';
import TodosPage from './Active Tab Pages/TodosPage';
import RewardsPage from './Active Tab Pages/RewardsPage';
import FooterNav from './Footer/Footer';

export default function MainBody() {
  const [activeTab, setActiveTab] = useState('Dailies');

  const renderActivePage = () => {
    switch (activeTab) {
      case 'Habits':
        return <HabitsPage />;
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

  return (
    <View style={styles.container}>
    <FooterNav />
      <ReminderBar />
      <Tabs activeTab={activeTab} onTabPress={setActiveTab} />
      <View style={styles.pageContainer}>{renderActivePage()}</View>
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
  },
});