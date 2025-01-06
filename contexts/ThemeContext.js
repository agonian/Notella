import React, { createContext, useState, useContext, useEffect } from 'react';
import { getStoredTheme, setStoredTheme, themes } from '../services/themeService';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(themes.default);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const theme = await getStoredTheme();
    setCurrentTheme(theme);
  };

  const changeTheme = async (themeId) => {
    await setStoredTheme(themeId);
    setCurrentTheme(themes[themeId]);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 