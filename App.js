import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
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
        <Drawer.Screen name="Notella" component={StackNavigator} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
