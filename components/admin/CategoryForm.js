import React, { useState, useMemo } from 'react';
import {
  View,
  TextInput,
  Switch,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const AVAILABLE_ICONS = [
  { name: 'folder', label: 'Klasör', category: 'Genel' },
  { name: 'folder-open', label: 'Açık Klasör', category: 'Genel' },
  { name: 'folder-shared', label: 'Paylaşılan Klasör', category: 'Genel' },
  { name: 'create-new-folder', label: 'Yeni Klasör', category: 'Genel' },
  { name: 'school', label: 'Okul', category: 'Eğitim' },
  { name: 'book', label: 'Kitap', category: 'Eğitim' },
  { name: 'library-books', label: 'Kütüphane', category: 'Eğitim' },
  { name: 'assignment', label: 'Ödev', category: 'Eğitim' },
  { name: 'class', label: 'Sınıf', category: 'Eğitim' },
  { name: 'description', label: 'Not', category: 'İçerik' },
  { name: 'article', label: 'Makale', category: 'İçerik' },
  { name: 'subject', label: 'Konu', category: 'İçerik' },
  { name: 'category', label: 'Kategori', category: 'İçerik' },
  { name: 'bookmark', label: 'Yer İmi', category: 'İçerik' },
  { name: 'lightbulb', label: 'Fikir', category: 'Bilim' },
  { name: 'psychology', label: 'Psikoloji', category: 'Bilim' },
  { name: 'science', label: 'Bilim', category: 'Bilim' },
  { name: 'biotech', label: 'Biyoloji', category: 'Bilim' },
  { name: 'calculate', label: 'Matematik', category: 'Bilim' },
  { name: 'language', label: 'Dil', category: 'Dil' },
  { name: 'translate', label: 'Çeviri', category: 'Dil' },
  { name: 'menu-book', label: 'Sözlük', category: 'Dil' },
];

const CategoryForm = ({
  form,
  setForm,
  onSubmit,
  onClose,
  isEditing,
}) => {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  const categories = useMemo(() => {
    const cats = ['Tümü', ...new Set(AVAILABLE_ICONS.map(icon => icon.category))];
    return cats;
  }, []);

  const filteredIcons = useMemo(() => {
    let icons = AVAILABLE_ICONS;
    
    if (selectedCategory !== 'Tümü') {
      icons = icons.filter(icon => icon.category === selectedCategory);
    }
    
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      icons = icons.filter(icon => 
        icon.label.toLowerCase().includes(searchLower) ||
        icon.category.toLowerCase().includes(searchLower)
      );
    }
    
    return icons;
  }, [selectedCategory, searchText]);

  const renderIconItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.iconItem,
        form.icon === item.name && styles.selectedIconItem
      ]}
      onPress={() => {
        setForm({ ...form, icon: item.name });
        setShowIconPicker(false);
      }}
    >
      <MaterialIcons
        name={item.name}
        size={32}
        color={form.icon === item.name ? '#4A90E2' : '#2C3E50'}
      />
      <Text style={[
        styles.iconItemText,
        form.icon === item.name && styles.selectedIconItemText
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {isEditing ? 'Kategori Düzenle' : 'Yeni Kategori'}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
          >
            <MaterialIcons name="close" size={24} color="#E74C3C" />
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Kategori Adı"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
          />
          
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Açıklama"
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            multiline
          />

          <TouchableOpacity
            style={styles.iconSelector}
            onPress={() => setShowIconPicker(true)}
          >
            <View style={styles.iconDisplay}>
              <MaterialIcons
                name={form.icon || 'folder'}
                size={24}
                color="#2C3E50"
              />
              <Text style={styles.iconText}>
                {AVAILABLE_ICONS.find(i => i.name === form.icon)?.label || 'Klasör'}
              </Text>
            </View>
            <MaterialIcons name="arrow-drop-down" size={24} color="#2C3E50" />
          </TouchableOpacity>

          <View style={styles.switchContainer}>
            <Text>Not Eklenebilir</Text>
            <Switch
              value={form.hasNotes}
              onValueChange={(value) =>
                setForm({ ...form, hasNotes: value })
              }
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              !form.name.trim() && styles.submitButtonDisabled
            ]}
            onPress={onSubmit}
            disabled={!form.name.trim()}
          >
            <Text style={styles.submitButtonText}>
              {isEditing ? 'Güncelle' : 'Ekle'}
            </Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={showIconPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowIconPicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>İkon Seç</Text>
                <TouchableOpacity
                  onPress={() => setShowIconPicker(false)}
                  style={styles.closeButton}
                >
                  <MaterialIcons name="close" size={24} color="#E74C3C" />
                </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={24} color="#95A5A6" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="İkon ara..."
                  value={searchText}
                  onChangeText={setSearchText}
                />
                {searchText ? (
                  <TouchableOpacity
                    onPress={() => setSearchText('')}
                    style={styles.clearSearch}
                  >
                    <MaterialIcons name="clear" size={20} color="#95A5A6" />
                  </TouchableOpacity>
                ) : null}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryList}
              >
                {categories.map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category && styles.selectedCategoryButton
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      selectedCategory === category && styles.selectedCategoryButtonText
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <FlatList
                data={filteredIcons}
                renderItem={renderIconItem}
                keyExtractor={item => item.name}
                numColumns={3}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.iconGrid}
              />
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  iconSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  iconDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2C3E50',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#95A5A6',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  clearSearch: {
    padding: 4,
  },
  categoryList: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: '#F5F6FA',
  },
  selectedCategoryButton: {
    backgroundColor: '#4A90E2',
  },
  categoryButtonText: {
    color: '#2C3E50',
    fontSize: 14,
  },
  selectedCategoryButtonText: {
    color: '#FFFFFF',
  },
  iconGrid: {
    padding: 8,
  },
  iconItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIconItem: {
    backgroundColor: '#EBF5FF',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  iconItemText: {
    marginTop: 4,
    fontSize: 12,
    color: '#2C3E50',
    textAlign: 'center',
  },
  selectedIconItemText: {
    color: '#4A90E2',
    fontWeight: 'bold',
  },
});

export default CategoryForm; 