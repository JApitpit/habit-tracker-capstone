import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import RewardItem from '../../TabItems/RewardItem';

export default function RewardsHeadPage() {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.grid}>
        <RewardItem type="head" />
        <RewardItem type="head" />
        <RewardItem type="head" />
        <RewardItem type="head" />
        <RewardItem type="head" />
        <RewardItem type="head" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 120,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
  },
});