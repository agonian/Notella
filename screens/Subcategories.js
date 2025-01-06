import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, query, where, orderBy, onSnapshot } from '@firebase/firestore';
import { db } from '../firebaseConfig/config';

export default function Subcategories({ route, navigation }) {
  const { categoryId, categoryName } = route.params;
  const [loading, setLoading] = useState(true);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    // Navigation başlığını ayarla
    navigation.setOptions({
      title: categoryName
    });

    // Alt kategorileri dinle
    const q = query(
      collection(db, 'categories'),
      where('parentId', '==', categoryId),
      orderBy('order', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        console.log('Alt kategori değişikliği algılandı');
        const subcategoriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Alt kategoriler:', subcategoriesData);
        setSubcategories(subcategoriesData);
      } catch (error) {
        console.error('Alt kategoriler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error('Alt kategori dinleyici hatası:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [categoryId, categoryName]);

  const handleSubcategoryPress = (subcategory) => {
    if (subcategory.hasNotes) {
      // Not eklenebilir kategoriye gidildiğinde
      navigation.navigate('Notes', {
        categoryId: subcategory.id,
        categoryName: subcategory.name
      });
    } else {
      // Alt kategorilere gidildiğinde
      navigation.navigate('Subcategories', {
        categoryId: subcategory.id,
        categoryName: subcategory.name
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {subcategories.length > 0 ? (
          subcategories.map(subcategory => (
            <TouchableOpacity
              key={subcategory.id}
              style={styles.subcategoryItem}
              onPress={() => handleSubcategoryPress(subcategory)}
            >
              <View style={styles.subcategoryInfo}>
                <MaterialIcons 
                  name={subcategory.icon || 'folder'} 
                  size={24} 
                  color="#2C3E50" 
                />
                <View style={styles.subcategoryTexts}>
                  <Text style={styles.subcategoryName}>{subcategory.name}</Text>
                  {subcategory.description ? (
                    <Text style={styles.subcategoryDescription}>
                      {subcategory.description}
                    </Text>
                  ) : null}
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#95A5A6" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="folder-open" size={64} color="#95A5A6" />
            <Text style={styles.emptyText}>Bu kategoride henüz içerik bulunmuyor</Text>
            <Text style={styles.emptySubText}>
              Admin panelinden yeni içerikler ekleyebilirsiniz
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subcategoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  subcategoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subcategoryTexts: {
    marginLeft: 12,
    flex: 1,
  },
  subcategoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  subcategoryDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#2C3E50',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 8,
    textAlign: 'center',
  },
});
