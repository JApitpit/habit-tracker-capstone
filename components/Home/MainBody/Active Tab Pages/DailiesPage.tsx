import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import DailiesItem from '../TabItems/DailiesItem';

export default function DailiesPage() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <DailiesItem />
      <DailiesItem />
      <DailiesItem />
      <DailiesItem />
      <DailiesItem />
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