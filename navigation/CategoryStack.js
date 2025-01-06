import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Categories from '../screens/Categories';
import Subcategories from '../screens/Subcategories';
import Notes from '../screens/Notes';
import NoteDetail from '../screens/NoteDetail';

const Stack = createNativeStackNavigator();

export default function CategoryStack() {
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
        name="Notes" 
        component={Notes}
      />
      <Stack.Screen 
        name="NoteDetail" 
        component={NoteDetail}
        options={{
          headerShown: true,
          headerTitle: 'Not Detayı'
        }}
      />
    </Stack.Navigator>
  );
} 