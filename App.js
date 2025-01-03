import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { auth } from './firebaseConfig/config';
import { subscribeToAuthChanges, getCurrentUserRole, USER_ROLES, signOut } from './services/authService';
import { ActivityIndicator, View, TouchableOpacity, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import HomeScreen from './screens/HomeScreen';
import Categories from './screens/Categories';
import Subcategories from './screens/Subcategories';
import SubcategoryDetails from './screens/SubcategoryDetails';
import Notes from './screens/Notes';
import AdminPanel from './screens/AdminPanel';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Alt navigasyonlar için Stack Navigator
function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen}
        options={{ title: 'Ana Sayfa' }}
      />
      <Stack.Screen 
        name="CategoriesScreen" 
        component={Categories}
        options={{ title: 'Kategoriler' }}
      />
      <Stack.Screen 
        name="Subcategories" 
        component={Subcategories}
        options={{ title: 'Alt Kategoriler' }}
      />
      <Stack.Screen 
        name="SubcategoryDetails" 
        component={SubcategoryDetails}
        options={{ title: 'Detaylar' }}
      />
      <Stack.Screen 
        name="Notes" 
        component={Notes}
        options={{ title: 'Notlar' }}
      />
    </Stack.Navigator>
  );
}

function CustomDrawerContent(props) {
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {props.children}
      </View>
      <TouchableOpacity 
        onPress={handleLogout}
        style={{
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: '#e1e1e1',
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
        <MaterialIcons name="logout" size={24} color="#E74C3C" />
        <Text style={{ marginLeft: 12, color: '#E74C3C', fontSize: 16 }}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

function DrawerNavigator() {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const loadUserRole = async () => {
      if (auth.currentUser) {
        const role = await getCurrentUserRole();
        setUserRole(role);
      }
    };
    loadUserRole();

    const unsubscribe = subscribeToAuthChanges(async (user) => {
      if (user) {
        const role = await getCurrentUserRole();
        setUserRole(role);
      } else {
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Drawer.Navigator 
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4A90E2',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerActiveTintColor: '#4A90E2',
        drawerStyle: {
          backgroundColor: '#fff',
          width: 280,
        }
      }}
    >
      <Drawer.Screen 
        name="MainStack" 
        component={MainStack}
        options={{ 
          title: 'Ana Sayfa',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          )
        }}
        listeners={({ navigation }) => ({
          drawerItemPress: () => {
            // Ana sayfaya dön
            navigation.navigate('MainStack', {
              screen: 'HomeScreen'
            });
          }
        })}
      />
      <Drawer.Screen 
        name="CategoriesDrawer" 
        component={Categories}
        options={{ 
          title: 'Kategoriler',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="category" size={size} color={color} />
          )
        }}
      />
      {userRole === USER_ROLES.TEACHER || userRole === USER_ROLES.ADMIN ? (
        <Drawer.Screen 
          name="NotesManagement" 
          component={MainStack}
          options={{ 
            title: 'Not Yönetimi',
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="edit" size={size} color={color} />
            )
          }}
          listeners={({ navigation }) => ({
            drawerItemPress: () => {
              // Not yönetimi sayfasına git
              navigation.navigate('MainStack', {
                screen: 'NotesManagement'
              });
            }
          })}
        />
      ) : null}
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
        name="Logout"
        component={EmptyComponent}
        options={{
          title: 'Çıkış Yap',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="logout" size={size} color="#E74C3C" />
          ),
          drawerItemStyle: { marginTop: 'auto' },
          drawerLabelStyle: { color: '#E74C3C' }
        }}
        listeners={({ navigation }) => ({
          drawerItemPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Çıkış hatası:', error);
            }
          },
        })}
      />
    </Drawer.Navigator>
  );
}

// Boş bileşen (Çıkış butonu için)
const EmptyComponent = () => null;

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size={40} color="#4A90E2" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <Stack.Screen name="Main" component={DrawerNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
