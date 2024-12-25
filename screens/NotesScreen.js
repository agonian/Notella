import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

export default function NotesScreen({ route }) {
  const { subcategory } = route.params;  // Parametre olarak gönderilen alt kategori

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{subcategory.name} Ders Notları</Text>
      
      {/* Ders notlarını listeleme */}
      <FlatList
        data={subcategory.notes}  // Seçilen alt kategorinin ders notları
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>{item.title}</Text>
            <Text style={styles.noteContent}>{item.content}</Text>
            <Text style={styles.noteAuthor}>Yazar: {item.author}</Text>
            <TouchableOpacity onPress={() => alert(`PDF Linki: ${item.pdf}`)}>
              <Text style={styles.notePdf}>PDF'yi Görüntüle</Text>
            </TouchableOpacity>
          </View>
        )}
      />
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
  noteCard: {
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  noteContent: {
    fontSize: 14,
    color: '#555',
  },
  noteAuthor: {
    fontSize: 12,
    color: '#777',
  },
  notePdf: {
    fontSize: 14,
    color: '#0066cc',
    marginTop: 10,
  },
});
