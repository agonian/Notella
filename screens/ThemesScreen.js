import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { themes } from '../services/themeService';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemesScreen() {
  const { currentTheme, changeTheme } = useTheme();

  const handleThemeSelect = async (themeId) => {
    await changeTheme(themeId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Temalar</Text>
      <Text style={styles.subtitle}>Uygulamanın görünümünü özelleştirin</Text>

      <ScrollView style={styles.themeList}>
        {Object.values(themes).map((theme) => (
          <TouchableOpacity
            key={theme.id}
            style={[
              styles.themeItem,
              currentTheme.id === theme.id && styles.selectedTheme,
            ]}
            onPress={() => handleThemeSelect(theme.id)}
          >
            <View style={styles.themeInfo}>
              <MaterialIcons 
                name={theme.icon || 'palette'} 
                size={24} 
                color={theme.colors.primary}
                style={styles.themeIcon} 
              />
              <Text style={styles.themeName}>{theme.name}</Text>
            </View>
            
            <View style={styles.colorPreview}>
              <View style={[styles.colorBox, { backgroundColor: theme.colors.primary }]} />
              <View style={[styles.colorBox, { backgroundColor: theme.colors.secondary }]} />
            </View>

            {currentTheme.id === theme.id && (
              <MaterialIcons name="check-circle" size={24} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 24,
  },
  themeList: {
    flex: 1,
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedTheme: {
    borderColor: '#4A90E2',
    backgroundColor: '#F8F9FA',
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeIcon: {
    marginRight: 12,
  },
  themeName: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  colorPreview: {
    flexDirection: 'row',
    marginRight: 12,
  },
  colorBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
}); 