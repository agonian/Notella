import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getNotes, deleteNote } from '../../services/noteService';
import { auth } from '../../firebaseConfig/config';

const CategoryItem = ({
  category,
  depth,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  onEdit,
  onDelete,
  onAddSubcategory,
  onAddNote,
  onEditNote,
  children,
}) => {
  const [notes, setNotes] = useState([]);
  const [isNotesVisible, setIsNotesVisible] = useState(false);
  const paddingLeft = 16 + (depth * 20);
  const hasChildren = category.children && category.children.length > 0;

  useEffect(() => {
    if (category.hasNotes && isNotesVisible) {
      loadNotes();
    }
  }, [category.id, isNotesVisible]);

  const loadNotes = async () => {
    try {
      const categoryNotes = await getNotes(category.id);
      setNotes(categoryNotes.filter(note => note.authorId === auth.currentUser.uid));
    } catch (error) {
      console.error('Notlar yüklenirken hata:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    Alert.alert(
      'Not Sil',
      'Bu notu silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(noteId);
              await loadNotes(); // Notları yeniden yükle
              Alert.alert('Başarılı', 'Not başarıyla silindi.');
            } catch (error) {
              console.error('Not silinirken hata:', error);
              Alert.alert('Hata', 'Not silinirken bir hata oluştu.');
            }
          }
        }
      ]
    );
  };

  const renderNote = ({ item }) => (
    <View style={[styles.noteContainer, { marginLeft: paddingLeft + 32 }]}>
      <View style={styles.noteContent}>
        <MaterialIcons name="description" size={20} color="#4A90E2" />
        <View style={styles.noteTextContainer}>
          <Text style={styles.noteTitle}>{item.title}</Text>
          {item.description && (
            <Text style={styles.noteDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.noteActions}>
        <TouchableOpacity 
          style={styles.noteActionButton}
          onPress={() => onEditNote(item)}
        >
          <MaterialIcons name="edit" size={18} color="#4A90E2" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.noteActionButton}
          onPress={() => handleDeleteNote(item.id)}
        >
          <MaterialIcons name="delete" size={18} color="#E74C3C" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View>
      <View style={[
        styles.container,
        { paddingLeft },
        isSelected && styles.selectedContainer,
        !category.hasNotes && styles.nonSelectableContainer
      ]}
      data-category-id={category.id}
      >
        <TouchableOpacity
          style={styles.contentContainer}
          onPress={() => {
            if (category.hasNotes) {
              setIsNotesVisible(!isNotesVisible);
              onSelect(category);
            }
          }}
          disabled={!category.hasNotes}
        >
          {hasChildren && (
            <TouchableOpacity
              onPress={onToggle}
              style={styles.expandButton}
            >
              <MaterialIcons
                name={isExpanded ? 'expand-more' : 'chevron-right'}
                size={24}
                color="#2C3E50"
              />
            </TouchableOpacity>
          )}
          
          <MaterialIcons
            name={category.icon || 'folder'}
            size={24}
            color={category.hasNotes ? "#2C3E50" : "#95A5A6"}
          />
          
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text style={[
                styles.title,
                !category.hasNotes && styles.nonSelectableText
              ]}>
                {category.name}
              </Text>
              {category.noteCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{category.noteCount}</Text>
                </View>
              )}
            </View>
            {category.description && (
              <Text style={styles.description}>{category.description}</Text>
            )}
            {!category.hasNotes && (
              <Text style={styles.notSelectableLabel}>Not eklenemez</Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.actions}>
          {category.hasNotes && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onAddNote(category)}
            >
              <MaterialIcons name="note-add" size={20} color="#27AE60" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onAddSubcategory}
          >
            <MaterialIcons name="add" size={20} color="#27AE60" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onEdit}
          >
            <MaterialIcons name="edit" size={20} color="#4A90E2" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onDelete}
          >
            <MaterialIcons name="delete" size={20} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>
      
      {isNotesVisible && notes.length > 0 && (
        <FlatList
          data={notes}
          renderItem={renderNote}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
      )}
      
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  selectedContainer: {
    backgroundColor: '#F5F6FA',
  },
  nonSelectableContainer: {
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButton: {
    padding: 4,
    marginRight: 8,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  badge: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  noteCount: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 8,
  },
  nonSelectableText: {
    color: '#95A5A6',
  },
  description: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  notSelectableLabel: {
    fontSize: 12,
    color: '#95A5A6',
    fontStyle: 'italic',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  // Not stilleri
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  noteContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  noteDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  noteActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteActionButton: {
    padding: 6,
    marginLeft: 4,
  },
});

export default CategoryItem; 