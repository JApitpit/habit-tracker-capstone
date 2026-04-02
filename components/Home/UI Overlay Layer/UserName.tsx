import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../styles/globalStyles';

export default function UserName() {
  return (
    <View style={styles.box}>
      <Text style={styles.name}>User Name</Text>
      <Text style={styles.level}>Level 0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
 name: {
  fontSize: 16,
  fontWeight: '700',
  color: COLORS.sunshineYellow,
  lineHeight: 18,
},

level: {
  fontSize: 11,
  fontWeight: '500',
  color: COLORS.sunshineYellow,
  lineHeight: 13,
},
});