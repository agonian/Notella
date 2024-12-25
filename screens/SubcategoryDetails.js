import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { db } from "../firebaseConfig/config";
import { collection, getDocs } from "firebase/firestore";
import { useNavigation } from '@react-navigation/native';

export default function SubcategoryDetails({ route }) {
  const { categoryId, categoryName, mainCatName} = route.params; // Parametreleri alıyoruz
  const [subcategories, setSubcategories] = useState([]); // Alt kategoriler
  const [ssubcategories, setSSubcategories] = useState([]); // Alt kategoriler
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true); // Yüklenme durumu

  useEffect(() => {
    const fetchSubcategories = async () => {
      setLoading(true);
      try {
        // Alt kategorilerin altında başka bir koleksiyon olup olmadığını sorguluyoruz
        const querySnapshot = await getDocs(collection(db, "Categories", mainCatName, "Sınavlar",categoryName,"Subjects"));
        const subcategoriesData = [];

        querySnapshot.forEach((doc) => {
          subcategoriesData.push({ id: doc.id, name: doc.id });
        });

        setSubcategories(subcategoriesData);
      } catch (error) {
        console.error("Alt alt kategoriler alınamadı:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, [categoryName]);




  const handleCategoryPress = (notecategory) => {
    // Alt kategoriye tıklandığında yeni ekrana yönlendiriyoruz
    console.log("Kategori id:", notecategory.id); // Kategori adını logla
    console.log("Kategori name Tıklanmış:", notecategory.name); // Kategori adını logla
    navigation.navigate("Notes", {
      
      categoryName: category.name,
      mainCatName: categoryName
    });
  };


  const renderSubcategoryItem = ({ item }) => (
    <TouchableOpacity style={styles.subcategoryCard}>
      <Text style={styles.subcategoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{categoryName} Alt Kategorileri:</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={subcategories}
          keyExtractor={(item) => item.id}
          renderItem={renderSubcategoryItem}
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
  subcategoryCard: {
    backgroundColor: "#FFDDC1",
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  subcategoryText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
