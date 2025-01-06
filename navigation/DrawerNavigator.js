import React, { useState, useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import { auth } from '../firebaseConfig/config';
import { subscribeToAuthChanges, getCurrentUserRole, USER_ROLES } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';

import CategoryStack from './CategoryStack';
import ProfileScreen from '../screens/ProfileScreen';
import AdminPanel from '../screens/AdminPanel';
import NoteDetail from '../screens/NoteDetail';
import ThemesScreen from '../screens/ThemesScreen';
import CustomDrawerContent from './DrawerContent';
import LoadingScreen from '../components/LoadingScreen';

const Drawer = createDrawerNavigator();

const HeaderLogo = () => {
  const { currentTheme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image
        source={require('../assets/icon.png')}
        style={{ width: 30, height: 30, marginRight: 8, borderRadius: 15 }}
        resizeMode="contain"
      />
      <Text style={{ color: currentTheme.colors.headerText, fontSize: 20, fontWeight: 'bold' }}>Notella</Text>
    </View>
  );
};

export default function DrawerNavigator() {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentTheme } = useTheme();

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        if (auth.currentUser) {
          const role = await getCurrentUserRole();
          setUserRole(role);
        }
      } catch (error) {
        console.error('Rol yükleme hatası:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserRole();

    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setIsLoading(true);
      if (user) {
        const role = await getCurrentUserRole();
        setUserRole(role);
      } else {
        setUserRole(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Drawer.Navigator 
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: currentTheme.colors.headerBackground,
        },
        headerTintColor: currentTheme.colors.headerText,
        headerTitle: HeaderLogo,
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerActiveTintColor: currentTheme.colors.drawerActiveColor,
        drawerStyle: {
          backgroundColor: currentTheme.colors.drawerBackground,
          width: 280,
        }
      }}
    >
      <Drawer.Screen 
        name="Categories" 
        component={CategoryStack}
        options={{ 
          title: 'Kategoriler',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="category" size={size} color={color} />
          )
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          title: 'Profilim',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          )
        }}
      />
      <Drawer.Screen 
        name="Themes" 
        component={ThemesScreen}
        options={{ 
          title: 'Temalar',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="palette" size={size} color={color} />
          )
        }}
      />
      {userRole === USER_ROLES.ADMIN && (
        <Drawer.Screen 
          name="AdminPanel" 
          component={AdminPanel}
          options={{ 
            title: 'Yönetim Paneli',
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="admin-panel-settings" size={size} color={color} />
            )
          }}
        />
      )}
      <Drawer.Screen 
        name="NoteDetail" 
        component={NoteDetail}
        options={{
          drawerLabel: () => null,
          drawerItemStyle: { display: 'none' },
          headerTitle: 'Not Detayı'
        }}
      />
    </Drawer.Navigator>
  );
} 