import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from 'react-native-vector-icons'; // İkonları buradan alıyoruz
import HomeScreen from './screens/HomeScreen';
import SubcategoriesScreen from './screens/SubcategoriesScreen';
import NotesScreen from './screens/NotesScreen';

// Drawer Navigator
const Drawer = createDrawerNavigator();

// Stack Navigator
const Stack = createStackNavigator();

// StackNavigator oluşturuyoruz
function StackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Subcategories" component={SubcategoriesScreen} />
      <Stack.Screen name="Notes" component={NotesScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator>
        <Drawer.Screen name="Anasayfa" component={StackNavigator} 
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
        />
        <Drawer.Screen name="Kategoriler" component={StackNavigator} 
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
        />
        <Drawer.Screen name="Profil" component={StackNavigator} 
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
        />
        <Drawer.Screen name="Kaydettiklerim" component={StackNavigator} 
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="bookmark" size={size} color={color} />
          ),
        }}
        />
        <Drawer.Screen name="Hakkında" component={StackNavigator} 
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="information-circle" size={size} color={color} />
          ),
        }}
        />
        <Drawer.Screen name="Giriş" component={StackNavigator} 
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="log-in" size={size} color={color} />
          ),
        }}        
        />
        <Drawer.Screen name="Çıkış" component={StackNavigator} 
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="log-out" size={size} color={color} />
          ),
        }}        
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
