import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from './screens/HomeScreen';
import LoginScreen from './components/LoginSignup/LoginScreen';
import SignUpScreen from './components/LoginSignup/SignUpScreen';

type Screen = 'login' | 'signup' | 'home';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resetForTesting = async () => {
      await AsyncStorage.removeItem('user');
      setScreen('login');
      setLoading(false);
    };

    resetForTesting();
  }, []);

  if (loading) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {screen === 'login' && (
        <LoginScreen
          onGoToSignup={() => setScreen('signup')}
          onLoginSuccess={() => setScreen('home')}
        />
      )}

      {screen === 'signup' && (
        <SignUpScreen
          onGoToLogin={() => setScreen('login')}
          onSignupSuccess={() => setScreen('home')}
        />
      )}

      {screen === 'home' && <HomeScreen />}
    </GestureHandlerRootView>
  );
}