import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../../styles/globalStyles';

export default function UserName() {
  const [username, setUsername] = useState('User Name');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUserString = await AsyncStorage.getItem('user');

        if (savedUserString) {
          const savedUser = JSON.parse(savedUserString);

          if (savedUser.username) {
            setUsername(savedUser.username);
          }
        }
      } catch (error) {
        console.log('Failed to load username:', error);
      }
    };

    loadUser();
  }, []);

  return (
    <View style={styles.box}>
      <Text style={styles.name}>{username}</Text>
      <Text style={styles.level}>Level 1</Text>
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