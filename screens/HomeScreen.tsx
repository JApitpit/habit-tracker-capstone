import React from 'react';
import { View } from 'react-native';
import DayTimeBackground from '../components/Home/Background Layer/DayTimeBackground';
import DuckAvatar from '../components/Home/Background Layer/DuckAvatar';
import HomepageHeader from '../components/Home/UI Overlay Layer/HomepageHeader';
import { globalStyles } from '../styles/globalStyles';
import ReminderBar from '../components/Home/MainBody/ReminderBar';
import Tabs from '../components/Home/MainBody/Tabs';
import MainBody from '../components/Home/MainBody/MainBody';

export default function HomeScreen() {
  return (
    <View style={globalStyles.screen}>
      <View style={globalStyles.heroArea}>
        <DayTimeBackground />
        <DuckAvatar />
        <HomepageHeader />
      </View>

      <View style={[globalStyles.mainContent, { paddingTop: 10 }]}>
        <MainBody />
      </View>
    </View>
  );
}