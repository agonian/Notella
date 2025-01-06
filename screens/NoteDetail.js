import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { db } from '../firebaseConfig/config';
import { collection, doc, getDoc } from '@firebase/firestore';

export default function NoteDetail({ route, navigation }) {
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState(null);
  const { noteId } = route.params;

  useEffect(() => {
    loadNote();
  }, [noteId]);

  const loadNote = async () => {
    try {
      const noteRef = doc(db, 'notes', noteId);
      const noteDoc = await getDoc(noteRef);
      
      if (noteDoc.exists()) {
        setNote({ id: noteDoc.id, ...noteDoc.data() });
        // Not başlığını header'a ayarla
        navigation.setOptions({ headerTitle: noteDoc.data().title });
      } else {
        Alert.alert('Hata', 'Not bulunamadı.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Not yüklenirken hata:', error);
      Alert.alert('Hata', 'Not yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (!note) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Not bulunamadı.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.noteContainer}>
        <View style={styles.header}>
          <MaterialIcons name="description" size={24} color="#4A90E2" />
          <Text style={styles.title}>{note.title}</Text>
        </View>

        <View style={styles.metadata}>
          <View style={styles.metaItem}>
            <MaterialIcons name="folder" size={20} color="#95A5A6" />
            <Text style={styles.metaText}>{note.categoryName}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialIcons name="person" size={20} color="#95A5A6" />
            <Text style={styles.metaText}>{note.authorName}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialIcons name="access-time" size={20} color="#95A5A6" />
            <Text style={styles.metaText}>
              {note.createdAt?.toDate().toLocaleDateString('tr-TR')}
            </Text>
          </View>
        </View>

        <Text style={styles.description}>{note.description}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 12,
    flex: 1,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 4,
  },
  description: {
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: 20,
  },
}); 