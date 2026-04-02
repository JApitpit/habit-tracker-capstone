import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../../styles/globalStyles';

export default function TodoItem() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Tap here to edit this to do</Text>
      <Text style={styles.subtitle}>Tap here to edit this to do</Text>

      <View style={styles.actions}>
        <View style={styles.btn}>
          <Text style={styles.btnText}>-</Text>
        </View>
        <View style={styles.btn}>
          <Text style={styles.btnText}>+</Text>
        </View>
      </View>
    </View>
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
    marginBottom: 4,
    color: COLORS.deepMidnightBlue,
  },
  subtitle: {
    color: COLORS.vividOrange,
    marginBottom: 12,
  },
  price: {
    position: 'absolute',
    right: 12,
    top: 12,
    color: COLORS.deepMidnightBlue,
    fontWeight: '700',
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
    color: COLORS.deepMidnightBlue,
  },
});