import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { db } from '../firebaseConfig/config';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "Categories"));
        const categoriesData = [];
        querySnapshot.forEach((doc) => {
          categoriesData.push({ id: doc.id, name: doc.id }); // id'yi ve name'i alıyoruz
        });
        setCategories(categoriesData);
      } catch (error) {
        console.error('Kategoriler alınamadı:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryPress = (category) => {
    console.log("Kategori id:", category.id); // Kategori adını logla
    console.log("Kategori name Tıklanmış:", category.name); // Kategori adını logla
    navigation.navigate('Subcategories', {
      categoryId: category.id,
      categoryName: category.name, // Burada category.name doğru şekilde gönderiliyor
    });
  };
  

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity style={styles.categoryCard} onPress={() => handleCategoryPress(item)}>
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kategoriler:</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategoryItem}
        />
      )}
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  categoryCard: {
    backgroundColor: '#FFE600',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
