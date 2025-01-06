import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export default function LoadingScreen() {
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