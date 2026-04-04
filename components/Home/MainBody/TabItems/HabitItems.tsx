import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS } from '../../../../styles/globalStyles';

type HabitItemProps = {
  title: string;
  subtitle?: string;
  currentCount: number;
  targetCount: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onToggleComplete: () => void;
  onOpenDetails: () => void;
};

export default function HabitItem({
  title,
  subtitle,
  currentCount,
  targetCount,
  onIncrement,
  onDecrement,
  onToggleComplete,
  onOpenDetails,
}: HabitItemProps) {
  const safeTarget = Math.max(1, targetCount);
  const safeCurrent = Math.max(0, Math.min(currentCount, safeTarget));
  const progressPercent = (safeCurrent / safeTarget) * 100;
  const isSingleCheckHabit = safeTarget === 1;
  const isCompleted = safeCurrent >= safeTarget;

  return (
    <Pressable style={styles.card} onPress={onOpenDetails}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle || ''}</Text>

      <View style={styles.progressSection}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressPercent}%` },
              isCompleted && styles.progressBarFillComplete,
            ]}
          />
        </View>

        <Text style={styles.counterText}>
          {safeCurrent}/{safeTarget}
        </Text>
      </View>

      {isSingleCheckHabit ? (
        <Pressable
          style={[
            styles.checkButton,
            isCompleted ? styles.checkButtonCompleted : styles.checkButtonIncomplete,
          ]}
          onPress={(e) => {
            e.stopPropagation();
            onToggleComplete();
          }}
        >
          <Text
            style={[
              styles.checkButtonText,
              isCompleted && styles.checkButtonTextCompleted,
            ]}
          >
            ✓
          </Text>
        </Pressable>
      ) : (
        <View style={styles.actions}>
          <Pressable
            style={styles.btn}
            onPress={(e) => {
              e.stopPropagation();
              onDecrement();
            }}
          >
            <Text style={styles.btnText}>-</Text>
          </Pressable>

          <Pressable
            style={styles.btn}
            onPress={(e) => {
              e.stopPropagation();
              onIncrement();
            }}
          >
            <Text style={styles.btnText}>+</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#d8cf9d',
    borderRadius: 14,
    padding: 14,
  },

  title: {
    fontWeight: '700',
    fontSize: 16,
    color: COLORS.deepMidnightBlue,
    marginBottom: 4,
  },

  subtitle: {
    color: COLORS.vividOrange,
    marginBottom: 12,
    fontSize: 13,
  },

  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  progressBarBackground: {
    flex: 1,
    height: 12,
    backgroundColor: '#b9efe5',
    borderRadius: 999,
    overflow: 'hidden',
    marginRight: 10,
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.teal,
    borderRadius: 999,
  },

  progressBarFillComplete: {
    backgroundColor: COLORS.vividOrange,
  },

  counterText: {
    minWidth: 42,
    textAlign: 'right',
    fontWeight: '700',
    color: COLORS.deepMidnightBlue,
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
  },

  btn: {
    flex: 1,
    backgroundColor: COLORS.teal,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },

  btnText: {
    fontWeight: '700',
    fontSize: 18,
    color: COLORS.deepMidnightBlue,
  },

  checkButton: {
    minHeight: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkButtonIncomplete: {
    backgroundColor: COLORS.teal,
  },

  checkButtonCompleted: {
    backgroundColor: COLORS.deepMidnightBlue,
  },

  checkButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.deepMidnightBlue,
  },

  checkButtonTextCompleted: {
    color: COLORS.sunshineYellow,
  },
});