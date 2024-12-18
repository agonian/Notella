import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from './screens/HomeScreen';
import Categories from './screens/Categories';
import Notes from './screens/Notes';
import SubcategoryDetails from './screens/SubcategoryDetails';
import Subcategories from './screens/Subcategories';

// Drawer Navigator
const Drawer = createDrawerNavigator();
// Stack Navigator
const Stack = createStackNavigator();


// Home Stack oluşturuyoruz
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

// Kategori Stack oluşturuyoruz
function StackNavigator2() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Categories" component={Categories} options={{ headerShown: false }} />
      <Stack.Screen name="Subcategories" component={Subcategories} />
      <Stack.Screen name="SubcategoryDetails" component={SubcategoryDetails} />
      <Stack.Screen name="Notes" component={Notes} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName='Kategoriler'>
        <Drawer.Screen name="Notella" component={HomeStack} />
        <Drawer.Screen name="Kategoriler" component={StackNavigator2} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
