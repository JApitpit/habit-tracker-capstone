import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import HabitItem from '../TabItems/HabitItems';

export default function HabitsPage() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <HabitItem />
      <HabitItem />
      <HabitItem />
      <HabitItem />
      <HabitItem />
    </ScrollView>
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