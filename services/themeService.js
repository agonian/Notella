import AsyncStorage from '@react-native-async-storage/async-storage';

export const themes = {
  default: {
    id: 'default',
    name: 'Varsayılan',
    colors: {
      primary: '#4A90E2',
      secondary: '#50C878',
      background: '#FFFFFF',
      text: '#2C3E50',
      textSecondary: '#7F8C8D',
      border: '#E2E8F0',
      headerBackground: '#4A90E2',
      headerText: '#FFFFFF',
      drawerBackground: '#FFFFFF',
      drawerActiveColor: '#4A90E2',
    },
  },
  dark: {
    id: 'dark',
    name: 'Koyu',
    colors: {
      primary: '#2C3E50',
      secondary: '#34495E',
      background: '#1A1A1A',
      text: '#FFFFFF',
      textSecondary: '#95A5A6',
      border: '#2C3E50',
      headerBackground: '#2C3E50',
      headerText: '#FFFFFF',
      drawerBackground: '#1A1A1A',
      drawerActiveColor: '#4A90E2',
    },
  },
  light: {
    id: 'light',
    name: 'Açık',
    colors: {
      primary: '#ECF0F1',
      secondary: '#BDC3C7',
      background: '#FFFFFF',
      text: '#2C3E50',
      textSecondary: '#7F8C8D',
      border: '#BDC3C7',
      headerBackground: '#ECF0F1',
      headerText: '#2C3E50',
      drawerBackground: '#FFFFFF',
      drawerActiveColor: '#2C3E50',
    },
  },
  nature: {
    id: 'nature',
    name: 'Doğa',
    colors: {
      primary: '#27AE60',
      secondary: '#2ECC71',
      background: '#FFFFFF',
      text: '#2C3E50',
      textSecondary: '#7F8C8D',
      border: '#27AE60',
      headerBackground: '#27AE60',
      headerText: '#FFFFFF',
      drawerBackground: '#FFFFFF',
      drawerActiveColor: '#27AE60',
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Okyanus',
    colors: {
      primary: '#2980B9',
      secondary: '#3498DB',
      background: '#FFFFFF',
      text: '#2C3E50',
      textSecondary: '#7F8C8D',
      border: '#2980B9',
      headerBackground: '#2980B9',
      headerText: '#FFFFFF',
      drawerBackground: '#FFFFFF',
      drawerActiveColor: '#2980B9',
    },
  },
};

const THEME_STORAGE_KEY = '@notella_theme';

export const getStoredTheme = async () => {
  try {
    const themeId = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    return themeId ? themes[themeId] : themes.default;
  } catch (error) {
    console.error('Tema yüklenirken hata:', error);
    return themes.default;
  }
};

export const setStoredTheme = async (themeId) => {
  try {
    await AsyncStorage.getItem(THEME_STORAGE_KEY);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, themeId);
    return true;
  } catch (error) {
    console.error('Tema kaydedilirken hata:', error);
    return false;
  }
}; 