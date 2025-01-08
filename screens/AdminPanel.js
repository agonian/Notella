import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import LoadingScreen from '../components/LoadingScreen';
import CategoryForm from '../components/admin/CategoryForm';
import CategoryList from '../components/admin/CategoryList';
import NoteForm from '../components/admin/NoteForm';
import * as categoryService from '../services/categoryService';
import { addNote, updateNote, deleteNote, getNotes } from '../services/noteService';
import { logger } from '../utils/logger';

export default function AdminPanel({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: 'folder',
    hasNotes: false,
    parentId: null,
  });
  const [noteForm, setNoteForm] = useState({
    title: '',
    description: '',
  });
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchText, setSearchText] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingNote, setEditingNote] = useState(null);

  // Filtrelenmiş kategorileri hesapla
  const filteredCategories = useMemo(() => {
    if (!searchText) return categories;
    return categoryService.getFilteredCategories(categories, searchText);
  }, [categories, searchText]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await categoryService.loadCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
      Alert.alert('Hata', 'Kategoriler yüklenirken bir hata oluştu.');
    }
  };

  const handleAddCategory = async () => {
    if (!categoryForm.name.trim()) {
      Alert.alert('Uyarı', 'Kategori adı boş olamaz.');
      return;
    }

    setLoading(true);
    try {
      await categoryService.addCategory(categoryForm);
      Alert.alert('Başarılı', 'Kategori başarıyla eklendi.');
      setCategoryForm({
        name: '',
        description: '',
        icon: 'folder',
        hasNotes: false,
        parentId: null,
      });
      setCategoryModalVisible(false);
      await loadCategories();
    } catch (error) {
      console.error('Kategori eklenirken hata:', error);
      Alert.alert('Hata', 'Kategori eklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubcategory = (parentCategory) => {
    setCategoryForm({
      name: '',
      description: '',
      icon: 'folder',
      hasNotes: false,
      parentId: parentCategory.id,
    });
    setEditingCategory(null);
    setCategoryModalVisible(true);
  };

  const handleEditCategory = (category) => {
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      icon: category.icon || 'folder',
      hasNotes: category.hasNotes || false,
      parentId: category.parentId,
    });
    setEditingCategory(category);
    setCategoryModalVisible(true);
  };

  const handleUpdateCategory = async () => {
    if (!categoryForm.name.trim()) {
      Alert.alert('Uyarı', 'Kategori adı boş olamaz.');
      return;
    }

    setLoading(true);
    try {
      await categoryService.updateCategory(editingCategory.id, categoryForm);
      Alert.alert('Başarılı', 'Kategori başarıyla güncellendi.');
      setCategoryModalVisible(false);
      setEditingCategory(null);
      await loadCategories();
    } catch (error) {
      console.error('Kategori güncellenirken hata:', error);
      Alert.alert('Hata', 'Kategori güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    Alert.alert(
      'Kategori Sil',
      'Bu kategoriyi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await categoryService.deleteCategory(category.id);
              Alert.alert('Başarılı', 'Kategori başarıyla silindi.');
              await loadCategories();
            } catch (error) {
              console.error('Kategori silinirken hata:', error);
              Alert.alert('Hata', 'Kategori silinirken bir hata oluştu.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleAddNote = async () => {
    if (!selectedCategory) {
      Alert.alert('Uyarı', 'Lütfen bir kategori seçin.');
      return;
    }
    if (!selectedCategory.hasNotes) {
      Alert.alert('Uyarı', 'Seçili kategoriye not eklenemez.');
      return;
    }
    if (!noteForm.title.trim()) {
      Alert.alert('Uyarı', 'Not başlığı boş olamaz.');
      return;
    }

    setLoading(true);
    try {
      const noteData = {
        ...noteForm,
        categoryId: selectedCategory.id,
        categoryPath: selectedCategory.path || selectedCategory.name,
      };
      await addNote(noteData);
      Alert.alert('Başarılı', 'Not başarıyla eklendi.');
      setNoteForm({ title: '', description: '' });
      setNoteModalVisible(false);
      setEditingNote(null);
      // Kategorileri yeniden yükle
      await loadCategories();
      // Notları yeniden yükle
      if (selectedCategory) {
        const updatedNotes = await getNotes(selectedCategory.id);
      }
    } catch (error) {
      logger.error('Not eklenirken hata:', error);
      Alert.alert('Hata', 'Not eklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditNote = (note) => {
    setNoteForm({
      title: note.title,
      description: note.description || '',
    });
    setEditingNote(note);
    // Notun ait olduğu kategoriyi bul ve seç
    const findCategory = (categories) => {
      for (const category of categories) {
        if (category.id === note.categoryId) {
          return category;
        }
        if (category.children?.length > 0) {
          const found = findCategory(category.children);
          if (found) return found;
        }
      }
      return null;
    };
    const category = findCategory(categories);
    if (category) {
      setSelectedCategory(category);
    }
    setNoteModalVisible(true);
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !selectedCategory) {
      Alert.alert('Hata', 'Not veya kategori bulunamadı.');
      return;
    }

    if (!noteForm.title.trim()) {
      Alert.alert('Uyarı', 'Not başlığı boş olamaz.');
      return;
    }

    setLoading(true);
    try {
      await updateNote(editingNote.id, {
        ...noteForm,
        categoryId: selectedCategory.id,
        categoryPath: selectedCategory.path || selectedCategory.name,
      });
      Alert.alert('Başarılı', 'Not başarıyla güncellendi.');
      setNoteForm({ title: '', description: '' });
      setNoteModalVisible(false);
      setEditingNote(null);
      // Kategorileri yeniden yükle
      await loadCategories();
    } catch (error) {
      logger.error('Not güncellenirken hata:', error);
      Alert.alert('Hata', 'Not güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleCollapseAll = () => {
    setExpandedCategories(new Set());
  };

  const handleSearchChange = (text) => {
    setSearchText(text);
  };

  const handleClearSearch = () => {
    setSearchText('');
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#95A5A6" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Kategori ara..."
            value={searchText}
            onChangeText={handleSearchChange}
          />
          {searchText ? (
            <TouchableOpacity onPress={handleClearSearch}>
              <MaterialIcons name="close" size={24} color="#95A5A6" />
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.collapseButton} 
            onPress={handleCollapseAll}
          >
            <MaterialIcons name="unfold-less" size={24} color="#4A90E2" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setCategoryForm({
                name: '',
                description: '',
                icon: 'folder',
                hasNotes: false,
                parentId: null,
              });
              setEditingCategory(null);
              setCategoryModalVisible(true);
            }}
          >
            <MaterialIcons name="add" size={24} color="#27AE60" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <CategoryList
          categories={filteredCategories}
          expandedCategories={expandedCategories}
          onToggleExpand={handleToggleExpand}
          onAddSubcategory={handleAddSubcategory}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
          onAddNote={(category) => {
            setSelectedCategory(category);
            setNoteForm({ title: '', description: '' });
            setEditingNote(null);
            setNoteModalVisible(true);
          }}
          onEditNote={handleEditNote}
        />
      </ScrollView>

      <Modal
        visible={categoryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <CategoryForm
          form={categoryForm}
          setForm={setCategoryForm}
          onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}
          onClose={() => {
            setCategoryModalVisible(false);
            setEditingCategory(null);
            setCategoryForm({
              name: '',
              description: '',
              icon: 'folder',
              hasNotes: false,
              parentId: null,
            });
          }}
          isEditing={!!editingCategory}
        />
      </Modal>

      <Modal
        visible={noteModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <NoteForm
          form={noteForm}
          setForm={setNoteForm}
          onSubmit={editingNote ? handleUpdateNote : handleAddNote}
          onClose={() => {
            setNoteModalVisible(false);
            setEditingNote(null);
            setNoteForm({ title: '', description: '' });
          }}
          isEditing={!!editingNote}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#2C3E50',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collapseButton: {
    padding: 8,
    marginRight: 8,
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
}); 