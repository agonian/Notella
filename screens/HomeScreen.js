import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { db } from '../firebaseConfig/config';
import { collection, getDocs } from "firebase/firestore";

export default function HomeScreen() {

  





  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hoş Geldiniz!</Text>
      <Text style={styles.subtitle}>Öğrenciler ve Öğretmenler İçin Notlar</Text>

      {/* Öğrenci ve Öğretmen giriş butonları */}
      <View style={styles.buttonContainer}>
        <Button title="Öğrenci Girişi" onPress={() => alert("Öğrenci girişi")} />
        <Button title="Öğretmen Girişi" onPress={() => alert("Öğretmen girişi")} />
      </View>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
});
