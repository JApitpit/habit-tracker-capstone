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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { COLORS, globalStyles } from '../../styles/globalStyles';

type Props = {
  onGoToSignup: () => void;
  onLoginSuccess: () => void;
};

export default function LoginScreen({
  onGoToSignup,
  onLoginSuccess,
}: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      onLoginSuccess();

    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        Alert.alert('Login Failed', 'Invalid email or password.');
      }
      console.log('Login error:', error.message);
      Alert.alert('Error', 'Something went wrong while logging in.');
    }
  };

  return (
    <View style={[globalStyles.screen, globalStyles.centeredContent, styles.container]}>
      <Image
        source={require('../../assets/produckfullcolorsimplelogo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.subtitle}>Log in to continue</Text>

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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onGoToSignup}>
        <Text style={styles.linkText}>
          Don’t have an account? <Text style={styles.linkBold}>Sign Up</Text>
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