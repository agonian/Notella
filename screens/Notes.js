import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot } from '@firebase/firestore';
import { db } from '../firebaseConfig/config';
import { logger } from '../utils/logger';

export default function Notes({ route, navigation }) {
  const { categoryId, categoryName } = route.params;
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    // Navigation başlığını ayarla
    navigation.setOptions({
      title: categoryName
    });

    // Notları dinle
    const q = query(
      collection(db, 'notes'),
      where('categoryId', '==', categoryId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        logger.log('Not değişikliği algılandı');
        const notesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        logger.log('Notlar:', notesData);
        setNotes(notesData);
      } catch (error) {
        logger.error('Notlar yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      logger.error('Not dinleyici hatası:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [categoryId, categoryName]);

  const handleNotePress = (note) => {
    // Not detayına git
    navigation.navigate('NoteDetail', {
      noteId: note.id,
      noteName: note.title
    });
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
        {notes.length > 0 ? (
          notes.map(note => (
            <TouchableOpacity
              key={note.id}
              style={styles.noteItem}
              onPress={() => handleNotePress(note)}
            >
              <View style={styles.noteInfo}>
                <MaterialIcons 
                  name={note.icon || 'description'} 
                  size={24} 
                  color="#2C3E50" 
                />
                <View style={styles.noteTexts}>
                  <Text style={styles.noteTitle}>{note.title}</Text>
                  {note.description ? (
                    <Text style={styles.noteDescription} numberOfLines={2}>
                      {note.description}
                    </Text>
                  ) : null}
                  <View style={styles.noteMetadata}>
                    <Text style={styles.noteDate}>
                      {new Date(note.createdAt?.toDate()).toLocaleDateString('tr-TR')}
                    </Text>
                    <Text style={styles.noteAuthor}>
                      {note.authorName || 'Anonim'}
                    </Text>
                  </View>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#95A5A6" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="note-add" size={64} color="#95A5A6" />
            <Text style={styles.emptyText}>Bu kategoride henüz not bulunmuyor</Text>
            <Text style={styles.emptySubText}>
              Yeni not eklemek için sağ üst köşedeki + butonunu kullanabilirsiniz
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
  noteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  noteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  noteTexts: {
    marginLeft: 12,
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  noteDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  noteMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  noteDate: {
    fontSize: 12,
    color: '#95A5A6',
  },
  noteAuthor: {
    fontSize: 12,
    color: '#95A5A6',
    fontStyle: 'italic',
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
