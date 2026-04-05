import React from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../styles/globalStyles';

type FooterNavProps = {
  onAddPress: () => void;
  onRecommendationsPress: () => void;
  recommendationCount: number;
};

export default function FooterNav({
  onAddPress,
  onRecommendationsPress,
  recommendationCount,
}: FooterNavProps) {
  return (
    <View style={styles.container}>
      <Pressable style={styles.sideButton} onPress={onRecommendationsPress}>
        <Ionicons name="sparkles" size={30} color={COLORS.sunshineYellow} />
        {recommendationCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {recommendationCount > 9 ? '9+' : recommendationCount}
            </Text>
          </View>
        )}
      </Pressable>

      <Pressable
        onPress={onAddPress}
        style={({ pressed }) => [
          styles.centerButton,
          {
            transform: [{ scale: pressed ? 0.9 : 1 }],
          },
        ]}
      >
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
    position: 'relative',
  },

  centerButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.sunshineYellow,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badge: {
    position: 'absolute',
    top: 4,
    right: 2,
    backgroundColor: '#ff453a',
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#0f122d',
  },

  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
});