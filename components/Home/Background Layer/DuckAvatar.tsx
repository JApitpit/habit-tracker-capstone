import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS } from '../../../styles/globalStyles';

export default function DuckAvatar() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/Base_Duck.png')}
        style={styles.duck}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 32,
    top: 95,
    width: 150,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    elevation: 200,
  },
  duck: {
    width: 170,
    height: 170,
  }
});