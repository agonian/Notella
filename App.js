import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from './screens/HomeScreen';
import SubcategoriesScreen from './screens/SubcategoriesScreen';
import NotesScreen from './screens/NotesScreen';
import data from './data.json';

// Drawer Navigator
const Drawer = createDrawerNavigator();

// Stack Navigator
const Stack = createStackNavigator();

// StackNavigator oluşturuyoruz
function StackNavigator({ navigation }) {  // Burada navigation parametresini alıyoruz
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
        {/* Ana ekran */}
        <Drawer.Screen name="Notella" component={StackNavigator} />
        
        {/* Kategorileri dinamik olarak ekliyoruz */}
        {data.categories.map((category) => (
          <Drawer.Screen
            key={category.id}
            name={category.name}
            component={SubcategoriesScreen}
            // Kategorinin her birine tıklandığında StackNavigator'ı gösteriyoruz
            initialParams={{ category: category }}
            
          />
        ))}
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
