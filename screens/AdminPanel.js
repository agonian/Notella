import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  TextInput,
  Modal,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import LoadingScreen from '../components/LoadingScreen';
import * as categoryService from '../services/categoryService';
import { addNote } from '../services/noteService';
import { logger } from '../utils/logger';

export default function AdminPanel({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [noteForm, setNoteForm] = useState({
    title: '',
    description: '',
  });
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: 'folder',
    hasNotes: false,
    parentId: null,
  });
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchText, setSearchText] = useState('');
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  // Filtrelenmiş kategorileri hesapla
  const filteredCategories = useMemo(() => {
    if (!searchText) return categories;
    return categoryService.getFilteredCategories(categories, searchText);
  }, [categories, searchText]);

  const toggleAllCategories = () => {
    // Eğer herhangi bir kategori açıksa, hepsini kapat
    if (expandedCategories.size > 0) {
      setExpandedCategories(new Set());
      setIsAllExpanded(false);
      return;
    }

    // Eğer tüm kategoriler kapalıysa, hepsini aç
    const allCategoryIds = new Set();
    const addCategoryIds = (categories) => {
      categories.forEach(category => {
        if (category) {  // Null kontrolü ekle
          allCategoryIds.add(category.id);
          if (category.children?.length > 0) {
            addCategoryIds(category.children);
          }
        }
      });
    };
    addCategoryIds(filteredCategories);  // categories yerine filteredCategories kullan
    setExpandedCategories(allCategoryIds);
    setIsAllExpanded(true);
  };

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
      setModalVisible(false);
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
    setSelectedCategory(null);
    setModalVisible(true);
  };

  const handleEditCategory = async (category) => {
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      icon: category.icon || 'folder',
      hasNotes: category.hasNotes || false,
      parentId: category.parentId,
    });
    setSelectedCategory(category);
    setModalVisible(true);
  };

  const handleUpdateCategory = async () => {
    if (!categoryForm.name.trim()) {
      Alert.alert('Uyarı', 'Kategori adı boş olamaz.');
      return;
    }

    setLoading(true);
    try {
      await categoryService.updateCategory(selectedCategory.id, categoryForm);
      Alert.alert('Başarılı', 'Kategori başarıyla güncellendi.');
      setModalVisible(false);
      setSelectedCategory(null);
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
      await addNote(noteForm, selectedCategory.id, selectedCategory.path || selectedCategory.name);
      Alert.alert('Başarılı', 'Not başarıyla eklendi.');
      setNoteForm({ title: '', description: '' });
      setSelectedCategory(null);
    } catch (error) {
      logger.error('Not eklenirken hata:', error);
      Alert.alert('Hata', 'Not eklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategorySelect = (category) => {
    if (category.hasNotes) {
      setSelectedCategory(category);
    }
  };

  const renderCategoryItem = (category, depth = 0) => {
    const paddingLeft = 16 + (depth * 20);
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <View key={category.id}>
        <TouchableOpacity
          onPress={() => handleCategorySelect(category)}
          style={[styles.categoryItem, { paddingLeft }]}
        >
          <View style={styles.categoryHeader}>
            {hasChildren && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  toggleCategory(category.id);
                }}
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
              color={category.hasNotes ? '#2C3E50' : '#95A5A6'} 
            />
            <Text style={[
              styles.categoryName,
              !category.hasNotes && styles.nonSelectableCategoryText
            ]}>
              {category.name}
            </Text>
          </View>
          <View style={styles.categoryActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                handleAddSubcategory(category);
              }}
            >
              <MaterialIcons name="add" size={20} color="#4A90E2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                handleEditCategory(category);
              }}
            >
              <MaterialIcons name="edit" size={20} color="#4A90E2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                handleDeleteCategory(category);
              }}
            >
              <MaterialIcons name="delete" size={20} color="#E74C3C" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        {hasChildren && isExpanded && (
          <View style={styles.childrenContainer}>
            {category.children.map(child => renderCategoryItem(child, depth + 1))}
          </View>
        )}
      </View>
    );
  };

  const renderCategorySelectItem = (category, depth = 0, parentPath = '') => {
    const paddingLeft = 16 + (depth * 20);
    const currentPath = parentPath ? `${parentPath} > ${category.name}` : category.name;
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <View key={category.id}>
        <TouchableOpacity
          style={[
            styles.categorySelectItem,
            { paddingLeft },
            selectedCategory?.id === category.id && styles.selectedCategoryItem,
            !category.hasNotes && styles.nonSelectableCategory
          ]}
          onPress={() => {
            if (category.hasNotes) {
              setSelectedCategory({...category, path: currentPath});
              setCategorySelectModalVisible(false);
            }
          }}
          disabled={!category.hasNotes}
        >
          <View style={styles.categorySelectHeader}>
            {hasChildren && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  toggleCategory(category.id);
                }}
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
              color={category.hasNotes ? '#2C3E50' : '#95A5A6'} 
            />
            <View style={styles.categorySelectContent}>
              <Text style={[
                styles.categorySelectName,
                selectedCategory?.id === category.id && styles.selectedCategoryName,
                !category.hasNotes && styles.nonSelectableCategoryText
              ]}>
                {category.name}
              </Text>
              {parentPath && (
                <Text style={styles.categoryPath} numberOfLines={1}>
                  {parentPath}
                </Text>
              )}
              {!category.hasNotes && (
                <Text style={styles.categorySelectLabel}>Not eklenemez</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
        {hasChildren && isExpanded && (
          <View style={styles.childrenContainer}>
            {category.children.map(child => 
              renderCategorySelectItem(child, depth + 1, currentPath)
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yönetim Paneli</Text>
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
            setSelectedCategory(null);
            setModalVisible(true);
          }}
        >
          <MaterialIcons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Yeni Kategori</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color="#95A5A6" />
        <TextInput
          style={styles.searchInput}
          placeholder="Kategori ara..."
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText ? (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <MaterialIcons name="clear" size={24} color="#95A5A6" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.categoriesContainer}>
        <View style={styles.categoriesHeader}>
          <Text style={styles.categoriesTitle}>Kategoriler</Text>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={toggleAllCategories}
          >
            <MaterialIcons
              name={isAllExpanded ? "unfold-less" : "unfold-more"}
              size={24}
              color="#2C3E50"
            />
          </TouchableOpacity>
        </View>
        {filteredCategories.map(category => renderCategoryItem(category))}
      </View>

      {/* Kategori Formu Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedCategory(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setSelectedCategory(null);
                }}
              >
                <MaterialIcons name="close" size={24} color="#E74C3C" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Kategori Adı"
              value={categoryForm.name}
              onChangeText={(text) => setCategoryForm(prev => ({ ...prev, name: text }))}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Açıklama"
              value={categoryForm.description}
              onChangeText={(text) => setCategoryForm(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
            />

            <View style={styles.iconSelector}>
              <Text style={styles.label}>İkon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['folder', 'folder-open', 'description', 'article', 'note', 'bookmark'].map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconButton,
                      categoryForm.icon === icon && styles.selectedIconButton
                    ]}
                    onPress={() => setCategoryForm(prev => ({ ...prev, icon }))}
                  >
                    <MaterialIcons
                      name={icon}
                      size={24}
                      color={categoryForm.icon === icon ? '#4A90E2' : '#2C3E50'}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.label}>Not Eklenebilir</Text>
              <Switch
                value={categoryForm.hasNotes}
                onValueChange={(value) => setCategoryForm(prev => ({ ...prev, hasNotes: value }))}
                trackColor={{ false: '#E2E8F0', true: '#4A90E2' }}
                thumbColor={categoryForm.hasNotes ? '#FFFFFF' : '#F5F6FA'}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, !categoryForm.name.trim() && styles.submitButtonDisabled]}
              onPress={selectedCategory ? handleUpdateCategory : handleAddCategory}
              disabled={!categoryForm.name.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {selectedCategory ? 'Güncelle' : 'Ekle'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Not Ekleme Formu */}
      <View style={styles.noteFormContainer}>
        <Text style={styles.sectionTitle}>Not Ekle</Text>
        <View style={styles.categorySelect}>
          <View style={styles.categorySelectInfo}>
            {selectedCategory ? (
              <>
                <MaterialIcons
                  name={selectedCategory.icon || 'folder'}
                  size={24}
                  color="#2C3E50"
                />
                <Text style={styles.selectedCategoryText}>
                  {selectedCategory.path || selectedCategory.name}
                </Text>
              </>
            ) : (
              <Text style={styles.placeholderText}>Yukarıdaki listeden bir kategori seçin...</Text>
            )}
          </View>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Not Başlığı"
          value={noteForm.title}
          onChangeText={(text) => setNoteForm(prev => ({ ...prev, title: text }))}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Not Açıklaması"
          value={noteForm.description}
          onChangeText={(text) => setNoteForm(prev => ({ ...prev, description: text }))}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedCategory || !selectedCategory.hasNotes || loading) && styles.submitButtonDisabled
          ]}
          onPress={handleAddNote}
          disabled={!selectedCategory || !selectedCategory.hasNotes || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Not Ekle</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expandButton: {
    padding: 4,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 12,
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  childrenContainer: {
    marginLeft: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  iconSelector: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 8,
  },
  iconButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginRight: 8,
  },
  selectedIconButton: {
    borderColor: '#4A90E2',
    backgroundColor: '#F5F6FA',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#95A5A6',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  noteFormContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  categorySelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categorySelectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedCategoryText: {
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: '#95A5A6',
  },
  categorySelectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  selectedCategoryItem: {
    backgroundColor: '#F5F6FA',
  },
  nonSelectableCategory: {
    backgroundColor: '#F8F9FA',
  },
  categorySelectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categorySelectContent: {
    marginLeft: 12,
    flex: 1,
  },
  categorySelectName: {
    fontSize: 16,
    color: '#2C3E50',
  },
  selectedCategoryName: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  nonSelectableCategoryText: {
    color: '#95A5A6',
  },
  categoryPath: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 2,
  },
  categorySelectLabel: {
    fontSize: 12,
    color: '#95A5A6',
    fontStyle: 'italic',
    marginTop: 2,
  },
  categorySelectList: {
    flex: 1,
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  categoriesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
}); 