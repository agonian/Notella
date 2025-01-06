import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function NoteForm({
  noteForm,
  setNoteForm,
  selectedCategory,
  onSubmit,
  loading,
  categories,
  expandedCategories,
  onToggleCategory,
  onSelectCategory,
}) {
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const renderCategoryItem = (category, depth = 0, parentPath = '') => {
    const paddingLeft = 16 + (depth * 20);
    const currentPath = parentPath ? `${parentPath} > ${category.name}` : category.name;
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const hasSelectableChildren = hasChildren && category.children.some(child => 
      child.hasNotes || (child.children && child.children.length > 0)
    );

    // Eğer kategori not eklenebilir değilse ve seçilebilir alt kategorisi yoksa gösterme
    if (!category.hasNotes && !hasSelectableChildren) {
      return null;
    }

    return (
      <View key={category.id}>
        <TouchableOpacity
          style={[
            styles.categoryItem,
            { paddingLeft },
            selectedCategory?.id === category.id && styles.selectedCategoryItem,
            !category.hasNotes && styles.nonSelectableCategory
          ]}
          onPress={() => {
            if (category.hasNotes) {
              onSelectCategory({...category, path: currentPath});
              setCategoryModalVisible(false);
            } else if (hasSelectableChildren) {
              onToggleCategory(category.id);
            }
          }}
        >
          <View style={styles.categoryInfo}>
            {hasSelectableChildren && (
              <MaterialIcons 
                name={isExpanded ? 'expand-more' : 'chevron-right'} 
                size={24} 
                color="#2C3E50" 
              />
            )}
            <MaterialIcons 
              name={category.icon || 'folder'} 
              size={24} 
              color={category.hasNotes ? (selectedCategory?.id === category.id ? '#4A90E2' : '#2C3E50') : '#95A5A6'} 
            />
            <View style={styles.categoryContent}>
              <Text style={[
                styles.categoryName,
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
              {!category.hasNotes && hasSelectableChildren && (
                <Text style={styles.groupLabel}>Alt kategorileri görüntülemek için tıklayın</Text>
              )}
            </View>
          </View>
          {category.hasNotes && selectedCategory?.id === category.id && (
            <MaterialIcons name="check" size={24} color="#4A90E2" />
          )}
        </TouchableOpacity>
        {hasSelectableChildren && isExpanded && category.children.map(child => 
          renderCategoryItem(child, depth + 1, currentPath)
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Not Ekle</Text>

      <TouchableOpacity 
        style={styles.categorySelect}
        onPress={() => setCategoryModalVisible(true)}
      >
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
            <Text style={styles.placeholderText}>Kategori seçin...</Text>
          )}
        </View>
        <MaterialIcons name="arrow-drop-down" size={24} color="#2C3E50" />
      </TouchableOpacity>

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
        onPress={onSubmit}
        disabled={!selectedCategory || !selectedCategory.hasNotes || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Not Ekle</Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={categoryModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kategori Seç</Text>
              <TouchableOpacity 
                onPress={() => setCategoryModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#E74C3C" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={24} color="#95A5A6" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Kategori ara..."
                value={searchText}
                onChangeText={setSearchText}
              />
              {searchText ? (
                <TouchableOpacity 
                  style={styles.clearSearch}
                  onPress={() => setSearchText('')}
                >
                  <MaterialIcons name="clear" size={20} color="#95A5A6" />
                </TouchableOpacity>
              ) : null}
            </View>

            <ScrollView style={styles.categoryList}>
              {categories.map(category => renderCategoryItem(category))}
              {categories.length === 0 && (
                <View style={styles.noResults}>
                  <MaterialIcons name="search-off" size={48} color="#95A5A6" />
                  <Text style={styles.noResultsText}>Kategori bulunamadı</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2C3E50',
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
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#95A5A6',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    width: '95%',
    maxHeight: '90%',
    padding: 20,
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
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
  },
  clearSearch: {
    padding: 4,
  },
  categoryList: {
    flex: 1,
  },
  categoryItem: {
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
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryContent: {
    marginLeft: 12,
    flex: 1,
  },
  categoryName: {
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
  groupLabel: {
    fontSize: 12,
    color: '#95A5A6',
    fontStyle: 'italic',
    marginTop: 2,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  noResultsText: {
    fontSize: 16,
    color: '#95A5A6',
    marginTop: 8,
  },
}); 