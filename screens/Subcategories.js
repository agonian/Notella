import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { db } from '../firebaseConfig/config';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function Subcategories({ route }) {
  const { categoryId, categoryName } = route.params; // Ana kategori bilgilerini alıyoruz
  const [categories, setCategories] = useState([]); // Alt kategoriler için state
  const [loading, setLoading] = useState(true); // Yüklenme durumu
  const navigation = useNavigation();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        // Alt kategorileri almak için ana kategorinin altındaki koleksiyonu sorguluyoruz
        const querySnapshot = await getDocs(collection(db, "Categories", categoryName, "Sınavlar"));
        const categoriesData = [];

        querySnapshot.forEach((doc) => {
          categoriesData.push({ id: doc.id, name: doc.id }); // ID ve isim
        });

        setCategories(categoriesData);
      } catch (error) {
        console.error("Alt kategoriler alınamadı:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [categoryName]);

  const handleCategoryPress = (subcategory) => {
    console.log("Kategori id:", subcategory.id); // Kategori adını logla
    console.log("Kategori name Tıklanmış:", subcategory.name); // Kategori adını logla
    
    // Alt kategoriye tıklandığında yeni ekrana yönlendiriyoruz
    navigation.navigate("SubcategoryDetails", {
      categoryId: subcategory.id,
      categoryName: subcategory.name,
      mainCatName: categoryName
    });
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity style={styles.categoryCard} onPress={() => handleCategoryPress(item)}>
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alt Kategoriler:</Text>

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
    backgroundColor: "#f4f4f4",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  categoryCard: {
    backgroundColor: "#FFE600",
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
