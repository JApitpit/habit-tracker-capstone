import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS } from '../../../styles/globalStyles';

type TabsProps = {
  activeTab: string;
  onTabPress: (tab: string) => void;
};

export default function Tabs({ activeTab, onTabPress }: TabsProps) {
  const tabs = ['Habits', 'Dailies', 'To Do’s', 'Rewards'];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab;

        return (
          <Pressable
            key={tab}
            style={[styles.tabButton, isActive && styles.activeTab]}
            onPress={() => onTabPress(tab)}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {tab}
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
    alignItems: 'center',
    gap: 18,
    marginTop: 12,
    marginBottom: 14,
    paddingHorizontal: 4,
    left: 30,
    top: 16,
  },

  tabButton: {
    paddingBottom: 4,
  },

  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9aa0b5',
  },

  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.sunshineYellow,
  },

  activeTabText: {
    color: COLORS.sunshineYellow,
  },
});