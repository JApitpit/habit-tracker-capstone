import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function DayTimeBackground() {
  return (
    <>
      <LinearGradient
        colors={['#e467d9', '#eebaf3']}
        style={styles.background}
      />


      <View style={styles.sun} />
      <View style={[styles.cloud, styles.cloud1]} />
      <View style={[styles.cloud, styles.cloud2]} />
      <View style={[styles.cloud, styles.cloud3]} />

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

  sun: {
    position: 'absolute',
    top: 70,
    right: 30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFD93D',
  },

  cloud: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 50,
    opacity: 0.9,
  },

  cloud1: {
    top: 108,
    left: 165,
    width: 100,
    height: 20,
  },

  cloud2: {
    top: 120,
    right: 90,
    width: 110,
    height: 15,
  },

  cloud3: {
    top: 108,
    left: 330,
    width: 70,
    height: 30,
  },

  grassStrip: {
    left: 0,
    right: 0,
    top: 125,
    height: 50,
    backgroundColor: '#4fc74f',
  },
});