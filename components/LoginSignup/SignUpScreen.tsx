import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { COLORS, globalStyles } from '../../styles/globalStyles';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, setDoc } from 'firebase/firestore';

type Props = {
  onGoToLogin: () => void;
};

export default function SignUpScreen({ onGoToLogin }: Props) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ✅ Email validation
  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // ✅ Password validation
  const isValidPassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return minLength && hasUppercase && hasNumber;
  };

  const handleSignup = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (!isValidPassword(password)) {
      Alert.alert(
        'Weak Password',
        'Password must be at least 8 characters, include 1 uppercase letter and 1 number.'
      );
      return;
    }

    try {

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      //save extra data to Firebase
      await setDoc(doc(db, "users", uid), {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        createdAt: new Date(),
      });
    
      Alert.alert('Success', 'Account created! Please log in.');
      onGoToLogin();
    } catch (error: any) {
      if (error.code == 'auth/email-already-in-use') {
        Alert.alert('This email is already in use. Please log in or use a different email.');
        return;
      }
      console.log('Signup error code:', error.code);
      console.log('Signup error message:', error.message);
      Alert.alert('Error', error.message || 'Something went wrong while signing up.');
    }
  };

  return (
    <View style={[globalStyles.screen, globalStyles.centeredContent, styles.container]}>
      <Image
        source={require('../../assets/produckfullcolorsimplelogo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.subtitle}>Create your account</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#888"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onGoToLogin}>
        <Text style={styles.linkText}>
          Already have an account? <Text style={styles.linkBold}>Log In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.white,
    marginBottom: 28,
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.teal,
    color: COLORS.black,
  },
  button: {
    width: '100%',
    backgroundColor: COLORS.sunshineYellow,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.deepMidnightBlue,
  },
  linkText: {
    fontSize: 14,
    color: COLORS.white,
  },
  linkBold: {
    fontWeight: '700',
    color: COLORS.sunshineYellow,
  },
});