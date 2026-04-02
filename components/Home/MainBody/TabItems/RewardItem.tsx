import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS } from '../../../../styles/globalStyles';

type RewardItemProps = {
  type?: 'head' | 'body';
};

export default function RewardItem({ type = 'head' }: RewardItemProps) {
  const isHead = type === 'head';

  return (
    <View style={styles.itemWrap}>
      <View
        style={[
          styles.card,
          isHead ? styles.headCard : styles.bodyCard,
        ]}
      >
        <Image
          source={
            isHead
              ? require('../../../../assets/crown.png')
              : require('../../../../assets/Puffer.png') 
          }
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.coin}>🪙</Text>
        <Text style={styles.price}>{isHead ? 10 : 20}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  itemWrap: {
    width: '47%',
    alignItems: 'center',
  },

  card: {
    width: 90,
    height: 110,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },

  headCard: {
    backgroundColor: '#f3f3f3',
    borderColor: '#d9d9d9',
  },

  bodyCard: {
    backgroundColor: '#e0f7f5',
    borderColor: COLORS.teal,
  },

  image: {
    width: 70,
    height: 70,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },

  coin: {
    fontSize: 14,
  },

  price: {
    color: COLORS.sunshineYellow,
    fontWeight: '700',
    fontSize: 18,
  },
});