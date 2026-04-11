import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { auth, db } from '../../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { COLORS } from '../../../styles/globalStyles';

export default function UserName() {
  const [username, setUsername] = useState('User Name');
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const statsRef = doc(db, 'userStats', user.uid);

    const unsubscribeUser = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setUsername(data.username || 'User Name');
        }
      },
      (error) => {
        console.log('Failed to load username:', error);
      }
    );

    const unsubscribeStats = onSnapshot(
      statsRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setLevel(typeof data.level === 'number' ? data.level : 1);
        } else {
          setLevel(1);
        }
      },
      (error) => {
        console.log('Failed to load level:', error);
      }
    );

    return () => {
      unsubscribeUser();
      unsubscribeStats();
    };
  }, []);

  return (
    <View style={styles.box}>
      <Text style={styles.name}>{username}</Text>
      <Text style={styles.level}>Level {level}</Text>
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