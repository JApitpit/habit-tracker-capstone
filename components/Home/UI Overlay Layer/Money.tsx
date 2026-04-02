import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../styles/globalStyles';

export default function Money() {
  return (
    <View style={styles.box}>
      <Text style={styles.amount}>10000</Text>
    <Text style={styles.dollarsign}>$</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row', 
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    paddingBottom: 15,
    left: 25,
    minWidth: 88,
    top: 12,
  },
  amount: {
    fontSize: 14,
    fontWeight: '300',
    color: COLORS.white,
  },
  dollarsign: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.vividYellow,
    marginLeft: 4,
  },
});