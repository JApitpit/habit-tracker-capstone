import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../styles/globalStyles';

export default function FooterNav() {
  return (
    <View style={styles.container}>
      <Pressable style={styles.sideButton}>
        <Ionicons name="sparkles" size={30} color={COLORS.sunshineYellow} />
      </Pressable>

      <Pressable style={styles.centerButton}>
        <Ionicons name="add" size={37} color={COLORS.deepMidnightBlue} />
      </Pressable>

      <Pressable style={styles.sideButton}>
        <Ionicons name="settings-outline" size={30} color={COLORS.sunshineYellow} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 999,         
    backgroundColor: '#0f122d',  
    height: 125,  
    paddingLeft: 32,
    paddingRight: 32, 
  },

  sideButton: {
    width: 58,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },

  centerButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.sunshineYellow,
    justifyContent: 'center',
    alignItems: 'center',
  },
});