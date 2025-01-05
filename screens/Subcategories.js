import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot } from '@firebase/firestore';
import { db } from '../firebaseConfig/config';

export default function Subcategories() {
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryId, categoryName } = route.params;
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "Kategoriler", categoryId, "Sinavlar"),
      (snapshot) => {
        const examsData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          examsData.push({
            id: doc.id,
            name: data.ad || doc.id,
            description: data.aciklama || '',
            icon: data.icon || 'description',
          });
        });
        setSubcategories(examsData);
        setLoading(false);
      },
      (error) => {
        console.error('Sınavlar dinlenirken hata:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [categoryId]);

  const handleExamPress = (exam) => {
    navigation.navigate("SubcategoryDetails", {
      categoryId: categoryId,
      examId: exam.id,
      examName: exam.name
    });
  };

  const renderExamItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryCard} 
      onPress={() => handleExamPress(item)}
    >
      <View style={styles.cardContent}>
        <MaterialIcons name={item.icon} size={24} color="#2C3E50" />
        <View style={styles.textContainer}>
          <Text style={styles.categoryText}>{item.name}</Text>
          {item.description ? (
            <Text style={styles.descriptionText}>{item.description}</Text>
          ) : null}
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#2C3E50" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={40} color="#4A90E2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.breadcrumb}>
        <TouchableOpacity 
          style={styles.breadcrumbItem}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="category" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <MaterialIcons name="chevron-right" size={20} color="#95A5A6" />
        <View style={styles.breadcrumbItem}>
          <MaterialIcons name="folder" size={20} color="#4A90E2" />
          <Text style={[styles.breadcrumbText, styles.activeBreadcrumb]} numberOfLines={1}>
            {categoryName}
          </Text>
        </View>
      </View>

      <FlatList
        data={subcategories}
        keyExtractor={(item) => item.id}
        renderItem={renderExamItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbText: {
    fontSize: 15,
    color: '#4A90E2',
    marginLeft: 6,
    fontWeight: '500',
  },
  activeBreadcrumb: {
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  descriptionText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  subjectCount: {
    fontSize: 12,
    color: '#4A90E2',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
