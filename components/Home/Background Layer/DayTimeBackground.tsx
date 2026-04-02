import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../../styles/globalStyles';

export default function DayTimeBackground() {
  return (
    <>
      <LinearGradient
        colors={['#e467d9', '#eebaf3']}
        style={styles.background}
      />
      <View style={styles.grassStrip} />
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: -40,  
    left: 0,
    right: 0,
    bottom: 100,
  },
  grassStrip: {
    left: 0,
    right: 0,
    top: 125,
    height: 50,
    backgroundColor: '#3cd43c',
  },
});