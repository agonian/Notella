import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, onSnapshot } from '@firebase/firestore';
import { db } from '../firebaseConfig/config';

export default function SubcategoryDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryId, categoryName, examId, examName } = route.params;
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [navigatingId, setNavigatingId] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "Kategoriler", categoryId, "Sinavlar", examId, "Konular"),
      (snapshot) => {
        const subjectsData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          subjectsData.push({
            id: doc.id,
            name: data.ad || doc.id,
            description: data.aciklama || '',
            icon: data.icon || 'subject',
          });
        });
        setSubjects(subjectsData);
        setLoading(false);
      },
      (error) => {
        console.error('Konular dinlenirken hata:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [categoryId, examId]);

  const handleSubjectPress = (subject) => {
    setNavigatingId(subject.id);
    navigation.navigate("Notes", {
      categoryId: categoryId,
      examId: examId,
      subjectId: subject.id,
      subjectName: subject.name
    });
    setNavigatingId(null);
  };

  const renderSubjectItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.subcategoryCard}
      onPress={() => handleSubjectPress(item)}
      disabled={navigatingId === item.id}
    >
      <View style={styles.cardContent}>
        <MaterialIcons name={item.icon} size={24} color="#2C3E50" />
        <View style={styles.textContainer}>
          <Text style={styles.subcategoryText}>{item.name}</Text>
          {item.description ? (
            <Text style={styles.descriptionText}>{item.description}</Text>
          ) : null}
        </View>
      </View>
      {navigatingId === item.id ? (
        <ActivityIndicator size={24} color="#4A90E2" />
      ) : (
        <MaterialIcons name="chevron-right" size={24} color="#2C3E50" />
      )}
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
          onPress={() => navigation.navigate('Categories')}
        >
          <MaterialIcons name="category" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <MaterialIcons name="chevron-right" size={20} color="#95A5A6" />
        <TouchableOpacity 
          style={styles.breadcrumbItem}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="folder" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <MaterialIcons name="chevron-right" size={20} color="#95A5A6" />
        <View style={styles.breadcrumbItem}>
          <MaterialIcons name="description" size={20} color="#4A90E2" />
          <Text style={[styles.breadcrumbText, styles.activeBreadcrumb]} numberOfLines={1}>
            {examName}
          </Text>
        </View>
      </View>

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        renderItem={renderSubjectItem}
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
    flexWrap: 'wrap',
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
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
  subcategoryCard: {
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
  subcategoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  descriptionText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
