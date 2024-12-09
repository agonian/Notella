import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useLayoutEffect } from 'react';  // useLayoutEffect'ü buradan içe aktarıyoruz


export default function SubcategoriesScreen({ route, navigation }) {
  const { category } = route.params;  // Parametre olarak gönderilen kategori
  

  // Geçersiz kategori kontrolü
  if (!category) {
    return (
      <View style={styles.container}>
        <Text>Geçersiz kategori seçimi!</Text>
      </View>
    );
  }



 // Dinamik başlık ayarları
 useLayoutEffect(() => {
  navigation.setOptions({
    title: category.name,  // Kategorinin adını başlık olarak ayarla
  });
}, [navigation, category.name]); // category.name her değiştiğinde başlığı güncelle


return (
  <View style={styles.container}>
    
    {/* Alt kategorileri listeleme */}
    {category.subcategories.length === 0 ? (
      <Text style={styles.title}>Bu kategoriye ait alt kategoriler bulunamadı.</Text>
    ) : (
      <FlatList
        data={category.subcategories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.subcategoryCard}
            onPress={() => navigation.navigate('Notes', { subcategory: item })}
          >
            <Text style={styles.subcategoryText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    )}
  </View>
);
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subcategoryCard: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#FFCE00',
    borderRadius: 10,
  },
  subcategoryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});
