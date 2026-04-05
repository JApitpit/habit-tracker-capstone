import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../styles/globalStyles';

export type RecommendationHabit = {
  id: string;
  title: string;
  subtitle?: string;
  currentCount: number;
  targetCount: number;
  repetition: 'Daily' | 'Weekly' | 'One Time';
  reminderEnabled: boolean;
  reminderTime?: string;
  notificationId?: string | null;

  reason: string;
};

type RecommendationPromptProps = {
  visible: boolean;
  habit: RecommendationHabit | null;
  onClose: () => void;
  onAccept: (habit: RecommendationHabit) => void;
  onReject: () => void;
};

export default function RecommendationPrompt({
  visible,
  habit,
  onClose,
  onAccept,
  onReject,
}: RecommendationPromptProps) {
  if (!habit) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons
                name="sparkles"
                size={18}
                color={COLORS.sunshineYellow}
              />
              <Text style={styles.title}>{habit.title}</Text>
            </View>

            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </Pressable>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <Text style={styles.label}>Details</Text>
              <Text style={styles.text}>
                {habit.subtitle || 'No details provided'}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Progress</Text>
              <Text style={styles.text}>
                {habit.currentCount} / {habit.targetCount} • {habit.repetition}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Why this needs help</Text>
              <Text style={styles.text}>{habit.reason}</Text>
            </View>

            <View style={styles.placeholder}>
              <Text style={styles.placeholderTitle}>
                AI Recommendation Placeholder
              </Text>
              <Text style={styles.placeholderText}>
                {
                  "Personalized recommendations will appear here later.\n\nFormat should be:\n\n- Increase/Decrease target count: 12312312\n\n- Change 6:00 PM to 8:00 PM"
                }
              </Text>
            </View>

            <View style={styles.actions}>
              <Pressable
                style={[styles.button, styles.rejectButton]}
                onPress={onReject}
              >
                <Text style={styles.rejectText}>Not Now</Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.acceptButton]}
                onPress={() => onAccept(habit)}
              >
                <Text style={styles.acceptText}>Apply Changes</Text>
              </Pressable>
            </View>

            <View style={{ height: 60 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  sheet: {
    height: '75%',
    backgroundColor: '#171b3a',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },

  scrollContent: {
    paddingBottom: 20,
  },

  card: {
    backgroundColor: '#20264d',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  label: {
    color: COLORS.sunshineYellow,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },

  text: {
    color: '#fff',
    fontSize: 14,
  },

  placeholder: {
    backgroundColor: 'rgba(255, 217, 90, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 217, 90, 0.35)',
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
  },

  placeholderTitle: {
    color: COLORS.sunshineYellow,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },

  placeholderText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 21,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },

  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rejectButton: {
    backgroundColor: '#2a2f5a',
  },

  acceptButton: {
    backgroundColor: COLORS.sunshineYellow,
  },

  rejectText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  acceptText: {
    color: '#171b3a',
    fontWeight: '800',
    fontSize: 14,
  },
});