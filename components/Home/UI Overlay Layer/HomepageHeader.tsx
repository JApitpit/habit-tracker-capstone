import React from 'react';
import { View, StyleSheet } from 'react-native';
import UserName from './UserName';
import Money from './Money';
import ProgressBars from './ProgressBars';

export default function HomepageHeader() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.infoBlock}>
        <UserName />
        <Money />
        <ProgressBars />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 28,
    top: 73,
  },
  infoBlock: {
    alignItems: 'flex-end',
    top: 64,
  },
});