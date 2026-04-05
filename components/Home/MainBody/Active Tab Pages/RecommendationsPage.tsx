import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../styles/globalStyles';
import { RecommendationHabit } from '../RecommendationPrompt';

type RecommendationsPageProps = {
  habits: RecommendationHabit[];
  onHabitPress: (habit: RecommendationHabit) => void;
  onExitPress: () => void;
};

export default function RecommendationsPage({
  habits,
  onHabitPress,
  onExitPress,
}: RecommendationsPageProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Recommendations</Text>
          <Text style={styles.subtitle}>
            Habits that may need support will show up here.
          </Text>
        </View>

        <Pressable onPress={onExitPress} style={styles.exitButton}>
          <Ionicons name="close" size={22} color="#fff" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {habits.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons
              name="sparkles-outline"
              size={34}
              color={COLORS.sunshineYellow}
            />
            <Text style={styles.emptyTitle}>Nothing here right now</Text>
            <Text style={styles.emptyText}>
              When a habit needs recommendations, it will appear here.
            </Text>
          </View>
        ) : (
          habits.map((habit) => (
            <Pressable
              key={habit.id}
              onPress={() => onHabitPress(habit)}
              style={({ pressed }) => [
                styles.itemCard,
                pressed && styles.itemCardPressed,
              ]}
            >
              <View style={styles.itemLeft}>
                <View style={styles.iconWrap}>
                  <Ionicons
                    name="sparkles"
                    size={18}
                    color={COLORS.deepMidnightBlue}
                  />
                </View>

                <View style={styles.textWrap}>
                  <Text style={styles.itemTitle}>{habit.title}</Text>
                  <Text style={styles.itemReason} numberOfLines={2}>
                    {habit.reason}
                  </Text>
                </View>
              </View>

              <View style={styles.rightSide}>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{habit.missedCount}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </View>
            </Pressable>
          ))
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 10,
    paddingHorizontal: 4,
    marginBottom: 12,
  },

  pageTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },

  subtitle: {
    color: '#c7cae6',
    fontSize: 14,
    maxWidth: 260,
  },

  exitButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#20264d',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },

  scroll: {
    flex: 1,
  },

  container: {
    paddingTop: 6,
    paddingBottom: 180,
  },

  emptyBox: {
    backgroundColor: '#20264d',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 12,
  },

  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },

  emptyText: {
    color: '#c7cae6',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  itemCard: {
    backgroundColor: '#20264d',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  itemCardPressed: {
    transform: [{ scale: 0.985 }],
  },

  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },

  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.sunshineYellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  textWrap: {
    flex: 1,
  },

  itemTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },

  itemReason: {
    color: '#c7cae6',
    fontSize: 13,
    lineHeight: 18,
  },

  rightSide: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  countBadge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FF453A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginRight: 8,
  },

  countBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },

  bottomSpacer: {
    height: 40,
  },
});