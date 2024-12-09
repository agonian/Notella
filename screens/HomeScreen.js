import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button } from 'react-native';

// JSON verisini içe aktar
const data = require('../data.json'); // JSON dosyasının doğru yolu

export default function HomeScreen({ navigation, route }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // Seçili kategori

  useEffect(() => {
    // JSON verisini state'e al
    setCategories(data.categories);

    // Drawer'dan gelen veriyi al
    if (route?.params?.categoryName) {
      const category = data.categories.find(cat => cat.name === route.params.categoryName);
      setSelectedCategory(category);
    }
  }, [route?.params]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hoş Geldiniz!</Text>
      <Text style={styles.subtitle}>Öğrenciler ve Öğretmenler İçin Notlar</Text>
      

      
      {/* Öğrenci ve Öğretmen giriş butonları */}
      <View style={styles.buttonContainer}>
        <Button title="Öğrenci Girişi" onPress={() => alert("Öğrenci girişi")} />
        <Button title="Öğretmen Girişi" onPress={() => alert("Öğretmen girişi")} />
      </View>

      <Text style={styles.categoryTitle}>Kategoriler</Text>
      
      {/* Kategorileri listeleme */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => navigation.navigate('Subcategories', { category: item })}
          >
            <Text style={styles.categoryText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
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
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  categoryCard: {
    backgroundColor: '#FFCE00',
    margin: 10,
    padding: 20,
    borderRadius: 10,
    width: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});
