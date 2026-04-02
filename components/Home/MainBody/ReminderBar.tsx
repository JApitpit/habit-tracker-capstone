import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../styles/globalStyles';

export default function ReminderBar() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Reminder</Text>

      <View style={styles.input}>
        <View style={styles.plusBtn}>
          <Text style={styles.plusText}>+</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.vividYellow,
    borderRadius: 11,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 40,
    top: 10,
  },

  label: {
    fontWeight: '600',
    color: COLORS.deepMidnightBlue,
    fontSize: 15,
  },

  input: {
    flex: 1,
    height: 24,
    backgroundColor: COLORS.deepMidnightBlue,
    borderRadius: 6,
    position: 'relative', 
    justifyContent: 'center',
  },

  plusBtn: {
    position: 'absolute', 
    right: 6,
    top: '50%',
    transform: [{ translateY: -10 }], 
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  plusText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});