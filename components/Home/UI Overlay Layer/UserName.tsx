import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { auth, db } from '../../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { COLORS } from '../../../styles/globalStyles';

export default function UserName() {
  const [username, setUsername] = useState('User Name');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          return;
        }
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUsername(data.username || 'User Name');
        } else {
          console.log('No such document!');
        }
      } 
      catch (error) {
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