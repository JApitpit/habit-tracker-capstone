import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../../../styles/globalStyles';
import RewardsCategoryTabs from './RewardsTab/RewardsCategoryTabs';
import RewardsAllPage from './RewardsTab/RewardsAllPage';
import RewardsHeadPage from './RewardsTab/RewardsHeadPage';
import RewardsBodyPage from './RewardsTab/RewardsBodyPage';

export default function RewardsPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const renderCategoryPage = () => {
    switch (activeCategory) {
      case 'All':
        return <RewardsAllPage />;
      case 'Head':
        return <RewardsHeadPage />;
      case 'Body':
        return <RewardsBodyPage />;
      default:
        return <RewardsAllPage />;
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.panel}>
        <RewardsCategoryTabs
          activeCategory={activeCategory}
          onCategoryPress={setActiveCategory}
        />

        <View style={styles.content}>
          {renderCategoryPage()}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingBottom: 50,
  },
  panel: {
    backgroundColor: COLORS.vividOrange,
    borderRadius: 12,
    paddingTop: 27,
    paddingHorizontal: 14,
    paddingBottom: 16,
  },
  content: {
    marginTop: 14,
  },
});