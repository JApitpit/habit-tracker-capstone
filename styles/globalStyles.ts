import { StyleSheet } from 'react-native';

export const COLORS = {
  deepMidnightBlue: '#0f122d',
  sunshineYellow: '#fde11b',
  teal: '#3dbdac',
  vividYellow: '#ecb91f',
  vividOrange: '#cd6128',
  white: '#ffffff',
  black: '#000000',
};

export const globalStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f122d',
  },
  

  heroArea: {
  height: 255,
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: 'transparent',
  },

  activeTabButton: {
  borderBottomWidth: 2,
  borderBottomColor: COLORS.sunshineYellow,
  },

  mainContent: {
  flex: 1,
  backgroundColor: COLORS.deepMidnightBlue,
  paddingTop: 12,  
  paddingHorizontal: 16,
},

  centeredContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  debugBox: {
    borderWidth: 2,
    borderColor: COLORS.deepMidnightBlue,
  },

  titleText: {
    color: COLORS.deepMidnightBlue,
    fontWeight: '700',
  },

  yellowText: {
    color: COLORS.sunshineYellow,
    fontWeight: '700',
  },

  cardPlaceholder: {
  height: 110,
  borderRadius: 14,
  backgroundColor: '#d8cf9d',
},
});