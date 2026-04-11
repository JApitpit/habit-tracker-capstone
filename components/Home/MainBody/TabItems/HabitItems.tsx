import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { COLORS } from '../../../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

type HabitItemProps = {
  title: string;
  subtitle?: string;
  currentCount: number;
  targetCount: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onToggleComplete: () => void;
  onOpenDetails: () => void;
  disabled?: boolean;

  xpLabel?: string;
  xpGain?: number;
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
  disabled = false,
  xpLabel = '+0 XP',
  xpGain = 0,
}: HabitItemProps) {
  const safeTarget = Math.max(1, targetCount);
  const safeCurrent = Math.max(0, Math.min(currentCount, safeTarget));
  const progressPercent = (safeCurrent / safeTarget) * 100;
  const isSingleCheckHabit = safeTarget === 1;
  const isCompleted = safeCurrent >= safeTarget;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const riseAnim = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    if (!xpGain || xpGain <= 0) return;

    fadeAnim.setValue(0);
    riseAnim.setValue(8);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(riseAnim, {
        toValue: -14,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 260,
        delay: 550,
        useNativeDriver: true,
      }),
    ]).start();
  }, [xpGain, fadeAnim, riseAnim]);

  return (
    <Pressable
      style={[styles.card, disabled && styles.cardDisabled]}
      onPress={onOpenDetails}
      disabled={disabled}
    >
      <View style={styles.topRow}>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle || ''}</Text>
        </View>

        <View style={styles.xpBadge}>
          <Ionicons name="star" size={12} color={COLORS.vividYellow} />
          <Text style={styles.xpBadgeText}>{xpLabel}</Text>
        </View>
      </View>

      {xpGain > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.xpPopup,
            {
              opacity: fadeAnim,
              transform: [{ translateY: riseAnim }],
            },
          ]}
        >
          <Text style={styles.xpPopupText}>+{xpGain} XP</Text>
        </Animated.View>
      )}

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
            disabled && styles.buttonDisabled,
          ]}
          disabled={disabled}
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
            style={[styles.btn, disabled && styles.buttonDisabled]}
            disabled={disabled}
            onPress={(e) => {
              e.stopPropagation();
              onDecrement();
            }}
          >
            <Text style={styles.btnText}>-</Text>
          </Pressable>

          <Pressable
            style={[styles.btn, disabled && styles.buttonDisabled]}
            disabled={disabled}
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
    position: 'relative',
    overflow: 'visible',
  },

  cardDisabled: {
    opacity: 0.75,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },

  textWrap: {
    flex: 1,
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

  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.deepMidnightBlue,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  xpBadgeText: {
    color: COLORS.sunshineYellow,
    fontSize: 11,
    fontWeight: '700',
  },

  xpPopup: {
    position: 'absolute',
    right: 14,
    top: 38,
    backgroundColor: COLORS.deepMidnightBlue,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 5,
  },

  xpPopupText: {
    color: COLORS.sunshineYellow,
    fontWeight: '800',
    fontSize: 12,
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

  buttonDisabled: {
    opacity: 0.55,
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