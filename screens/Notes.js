import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, onSnapshot } from '@firebase/firestore';
import { db } from '../firebaseConfig/config';

export default function Notes() {
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryId, examId, subjectId, subjectName, categoryName, examName } = route.params;
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "Kategoriler", categoryId, "Sinavlar", examId, "Konular", subjectId, "Notlar"),
      (snapshot) => {
        const notesData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          notesData.push({
            id: doc.id,
            title: data.baslik || 'İsimsiz Not',
            content: data.icerik || '',
            date: data.tarih ? new Date(data.tarih.toDate()).toLocaleDateString('tr-TR') : '',
            author: data.yazar || '',
          });
        });
        setNotes(notesData);
        setLoading(false);
      },
      (error) => {
        console.error('Notlar dinlenirken hata:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [categoryId, examId, subjectId]);

  const renderNoteItem = ({ item }) => (
    <View style={styles.noteCard}>
      <View style={styles.noteHeader}>
        <MaterialIcons name="description" size={24} color="#4A90E2" />
        <View style={styles.noteInfo}>
          <Text style={styles.noteTitle}>{item.title}</Text>
          <View style={styles.noteMetadata}>
            {item.author && (
              <View style={styles.metadataItem}>
                <MaterialIcons name="person" size={14} color="#95A5A6" />
                <Text style={styles.metadataText}>{item.author}</Text>
              </View>
            )}
            {item.date && (
              <View style={styles.metadataItem}>
                <MaterialIcons name="schedule" size={14} color="#95A5A6" />
                <Text style={styles.metadataText}>{item.date}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <Text style={styles.noteContent} numberOfLines={3}>{item.content}</Text>
    </View>
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
          onPress={() => navigation.navigate('Subcategories', { categoryId, categoryName })}
        >
          <MaterialIcons name="folder" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <MaterialIcons name="chevron-right" size={20} color="#95A5A6" />
        <TouchableOpacity 
          style={styles.breadcrumbItem}
          onPress={() => navigation.navigate('SubcategoryDetails', { 
            categoryId, 
            categoryName,
            examId,
            examName 
          })}
        >
          <MaterialIcons name="description" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <MaterialIcons name="chevron-right" size={20} color="#95A5A6" />
        <View style={styles.breadcrumbItem}>
          <MaterialIcons name="note" size={20} color="#4A90E2" />
          <Text style={[styles.breadcrumbText, styles.activeBreadcrumb]} numberOfLines={1}>
            {subjectName}
          </Text>
        </View>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderNoteItem}
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
    maxWidth: 150,
  },
  activeBreadcrumb: {
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noteHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  noteInfo: {
    flex: 1,
    marginLeft: 12,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  noteMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 12,
    color: '#95A5A6',
    marginLeft: 4,
  },
  noteContent: {
    fontSize: 14,
    color: '#34495E',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
