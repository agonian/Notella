import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

export default function App() {
  useEffect(() => {
    // Splash screen'i otomatik gizlemeyi devre dışı bırak
    SplashScreen.preventAutoHideAsync();

    // Splash screen'i 3 saniye sonra gizle
    setTimeout(async () => {
      await SplashScreen.hideAsync();
    }, 3000); // 3000ms = 3 saniye
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}> Welcome to Notella!</Text>
      <Text style={styles.subtitle}> Kategorilere Göz At!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fef08a',
  },
  title: {
    fontSize:32,
    fontWeight:'bold',
    color:'#333',
  },
  subtitle:{
    fontSize:18,
    color:'#666',
  }
});
