import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS } from '../../../../../styles/globalStyles';

type RewardsCategoryTabsProps = {
  activeCategory: string;
  onCategoryPress: (category: string) => void;
};

export default function RewardsCategoryTabs({
  activeCategory,
  onCategoryPress,
}: RewardsCategoryTabsProps) {
  const categories = ['All', 'Head', 'Body'];

  return (
    <View style={styles.container}>
      {categories.map((category) => {
        const isActive = activeCategory === category;

        return (
          <Pressable
            key={category}
            onPress={() => onCategoryPress(category)}
            style={styles.tabButton}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {category}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  tabButton: {
    paddingBottom: 2,
  },
  tabText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 12,
  },
  activeTabText: {
    color: COLORS.sunshineYellow,
    fontWeight: '700',
  },
});