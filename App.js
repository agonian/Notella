import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { auth } from './firebaseConfig/config';
import { subscribeToAuthChanges, getCurrentUserRole, USER_ROLES, signOut } from './services/authService';
import { ActivityIndicator, View, TouchableOpacity, Text, StatusBar, ScrollView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { DrawerItemList } from '@react-navigation/drawer';

import Categories from './screens/Categories';
import Subcategories from './screens/Subcategories';
import SubcategoryDetails from './screens/SubcategoryDetails';
import Notes from './screens/Notes';
import AdminPanel from './screens/AdminPanel';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Kategori ve alt sayfaları için Stack Navigator
function CategoryStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false 
      }}
    >
      <Stack.Screen 
        name="CategoriesMain" 
        component={Categories}
      />
      <Stack.Screen 
        name="Subcategories" 
        component={Subcategories}
      />
      <Stack.Screen 
        name="SubcategoryDetails" 
        component={SubcategoryDetails}
      />
      <Stack.Screen 
        name="Notes" 
        component={Notes}
      />
    </Stack.Navigator>
  );
}

// Yükleme ekranı komponenti
function LoadingScreen() {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#fff' 
    }}>
      <ActivityIndicator size="large" color="#4A90E2" />
      <Text style={{ marginTop: 20, color: '#666', fontSize: 16 }}>
        Yükleniyor...
      </Text>
    </View>
  );
}

function CustomDrawerContent(props) {
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const loadUserInfo = async () => {
      if (auth.currentUser) {
        setUserEmail(auth.currentUser.email);
        const role = await getCurrentUserRole();
        setUserRole(role);
      }
    };
    loadUserInfo();
  }, []);

  const getRoleText = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'Yönetici';
      case USER_ROLES.TEACHER:
        return 'Öğretmen';
      case USER_ROLES.USER:
        return 'Öğrenci';
      default:
        return 'Bilinmeyen Rol';
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ 
        padding: 16,
        paddingTop: StatusBar.currentHeight + 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e1e1e1',
        backgroundColor: '#4A90E2',
      }}>
        <View style={{ 
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 10,
        }}>
          <MaterialIcons name="account-circle" size={50} color="#FFFFFF" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }} numberOfLines={1}>{userEmail}</Text>
            <View style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: 12,
              marginTop: 4,
              alignSelf: 'flex-start'
            }}>
              <MaterialIcons 
                name={userRole === USER_ROLES.ADMIN ? 'admin-panel-settings' : userRole === USER_ROLES.TEACHER ? 'school' : 'person'} 
                size={16} 
                color="#FFFFFF" 
              />
              <Text style={{ color: '#FFFFFF', marginLeft: 4, fontSize: 12 }}>{getRoleText(userRole)}</Text>
            </View>
          </View>
        </View>
      </View>
      <ScrollView style={{ flex: 1 }}>
        <DrawerItemList {...props} />
      </ScrollView>
      <TouchableOpacity 
        onPress={handleLogout}
        style={{
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: '#e1e1e1',
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#fff',
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
  const [isLoading, setIsLoading] = useState(true);

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

  const HeaderLogo = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image
        source={require('./assets/icon.png')}
        style={{ width: 30, height: 30, marginRight: 8, borderRadius: 15 }}
        resizeMode="contain"
      />
      <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' }}>Notella</Text>
    </View>
  );

  return (
    <Drawer.Navigator 
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4A90E2',
        },
        headerTintColor: '#fff',
        headerTitle: (props) => <HeaderLogo {...props} />,
        headerTitleAlign: 'center',
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
    </Drawer.Navigator>
  );
}

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
