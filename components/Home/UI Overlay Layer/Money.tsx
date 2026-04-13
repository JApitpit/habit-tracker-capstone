import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../styles/globalStyles';
import { subscribeToUserMoney } from '../../../Backend/services/moneyService';
import type { UserMoneyDoc } from '../../../Backend/types/money';

export default function Money() {
  const [money, setMoney] = useState<UserMoneyDoc | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToUserMoney(
      (data) => setMoney(data),
      (error) => console.error('Money subscription error:', error)
    );

    return unsubscribe;
  }, []);

  return (
    <View style={styles.box}>
      <Text style={styles.amount}>{money?.balance ?? 0}</Text>
      <Text style={styles.grape}>🍇</Text>
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
    left: 40,
    minWidth: 88,
    top: 12,
  },
  amount: {
    fontSize: 14,
    fontWeight: '300',
    color: COLORS.white,
  },
  grape: {
    fontSize: 14,
    marginLeft: 8,
  },
});