import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { onAuthStateChanged } from 'firebase/auth';

import HomeScreen from './screens/HomeScreen';
import LoginScreen from './components/LoginSignup/LoginScreen';
import SignUpScreen from './components/LoginSignup/SignUpScreen';
import { auth } from './firebase';

type Screen = 'login' | 'signup' | 'home';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setScreen(user ? 'home' : 'login');
      setLoading(false);
    });

    return unsubscribe;
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
        <SignUpScreen onGoToLogin={() => setScreen('login')} />
      )}

      {screen === 'home' && <HomeScreen />}
    </GestureHandlerRootView>
  );
}