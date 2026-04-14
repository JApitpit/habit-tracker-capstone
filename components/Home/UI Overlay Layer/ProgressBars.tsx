import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { COLORS } from '../../../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { subscribeToHp } from '../../../Backend/services/healthService';
import type { UserHpDoc } from '../../../Backend/types/health';

type UserStats = {
  level: number;
  currentLevelXp: number;
  xpToNextLevel: number;
};

export default function ProgressBars() {
  const [stats, setStats] = useState<UserStats>({
    level: 1,
    currentLevelXp: 0,
    xpToNextLevel: 100,
  });


  const [hp, setHp] = useState<UserHpDoc>({
    userId: '',
    currentHp: 100,
    maxHp: 100,
    updatedAt: '',
  });

  // XP subscription
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const statsRef = doc(db, 'userStats', user.uid);
    const unsubscribe = onSnapshot(statsRef, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      setStats({
        level: data.level ?? 1,
        currentLevelXp: data.currentLevelXp ?? 0,
        xpToNextLevel: data.xpToNextLevel ?? 100,
      });
    });
    return unsubscribe;
  }, []);


  useEffect(() => {
    const unsubscribe = subscribeToHp((data) => setHp(data));
    return () => unsubscribe();
  }, []);

  const xpPercent = useMemo(() => {
    if (stats.xpToNextLevel <= 0) return 0;
    return Math.min(100, (stats.currentLevelXp / stats.xpToNextLevel) * 100);
  }, [stats]);


  const hpPercent = useMemo(() => {
    if (hp.maxHp <= 0) return 0;
    return Math.min(100, (hp.currentHp / hp.maxHp) * 100);
  }, [hp]);

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.row}>
          <View style={styles.barBackground}>
            <View style={[styles.topBarFill, { width: `${hpPercent}%` }]} />
          </View>
          <Ionicons name="heart" size={14} color={COLORS.vividOrange} />
        </View>
        <Text style={styles.text}>
          [{hp.currentHp}/{hp.maxHp}]
        </Text>
      </View>
      <View>
        <View style={styles.row}>
          <View style={styles.barBackground}>
            <View style={[styles.bottomBarFill, { width: `${xpPercent}%` }]} />
          </View>
          <Ionicons name="star" size={14} color={COLORS.vividYellow} />
        </View>
        <Text style={styles.text}>
          [{stats.currentLevelXp}/{stats.xpToNextLevel}]
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    gap: 8,
    height: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barBackground: {
    height: 10,
    borderWidth: 2,
    borderColor: COLORS.deepMidnightBlue,
    backgroundColor: COLORS.teal,
    borderRadius: 999,
    overflow: 'hidden',
    flex: 1,
  },
  topBarFill: {
    height: '100%',
    backgroundColor: COLORS.vividOrange,
    borderRadius: 999,
  },
  bottomBarFill: {
    height: '100%',
    backgroundColor: COLORS.vividYellow,
    borderRadius: 999,
  },
  text: {
    fontSize: 6,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 2,
  },
});