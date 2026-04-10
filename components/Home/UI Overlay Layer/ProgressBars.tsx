import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

export default function ProgressBars() {
  return (
    <View style={styles.container}>

      <View style={styles.row}>
        <View style={styles.barBackground}>
          <View style={[styles.topBarFill, { width: '78%' }]} />
        </View>
        <Ionicons name="heart" size={14} color={COLORS.vividOrange} />
      </View>

      <View style={styles.row}>
        <View style={styles.barBackground}>
          <View style={[styles.bottomBarFill, { width: '55%' }]} />
        </View>
        <Ionicons name="star" size={14} color={COLORS.vividYellow} />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    gap: 8,
    height: 40,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  barBackground: {
    height: 10,
    borderWidth: 2,
    borderColor: COLORS.deepMidnightBlue,
    backgroundColor: COLORS.teal,
    borderRadius: 999,
    overflow: 'hidden',
    flex: 1,
  },

  topBarFill: {
    height: '100%',
    backgroundColor: COLORS.vividOrange,
    borderRadius: 999,
  },

  bottomBarFill: {
    height: '100%',
    backgroundColor: COLORS.vividYellow,
    borderRadius: 999,
  },
});