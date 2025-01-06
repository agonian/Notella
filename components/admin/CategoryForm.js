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

const AVAILABLE_ICONS = [
  { name: 'folder', label: 'Klasör' },
  { name: 'school', label: 'Okul' },
  { name: 'book', label: 'Kitap' },
  { name: 'description', label: 'Not' },
  { name: 'library-books', label: 'Kütüphane' },
  { name: 'assignment', label: 'Ödev' },
  { name: 'class', label: 'Sınıf' },
  { name: 'subject', label: 'Konu' },
  { name: 'category', label: 'Kategori' },
  { name: 'bookmark', label: 'Yer İmi' },
  { name: 'lightbulb', label: 'Fikir' },
  { name: 'psychology', label: 'Psikoloji' },
  { name: 'science', label: 'Bilim' },
  { name: 'calculate', label: 'Matematik' },
  { name: 'language', label: 'Dil' },
];

export default function CategoryForm({ 
  visible, 
  onClose, 
  loading, 
  categoryForm, 
  setCategoryForm, 
  onSubmit, 
  isEditing 
}) {
  const [showIconPicker, setShowIconPicker] = useState(false);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {isEditing ? 'Kategori Düzenle' : 'Yeni Kategori'}
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="Kategori Adı"
            value={categoryForm.name}
            onChangeText={(text) => setCategoryForm(prev => ({ ...prev, name: text }))}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Açıklama"
            value={categoryForm.description}
            onChangeText={(text) => setCategoryForm(prev => ({ ...prev, description: text }))}
          />
          
          <TouchableOpacity
            style={styles.iconSelector}
            onPress={() => setShowIconPicker(true)}
          >
            <View style={styles.iconDisplay}>
              <MaterialIcons 
                name={categoryForm.icon || 'folder'} 
                size={24} 
                color="#2C3E50" 
              />
              <Text style={styles.iconText}>
                {AVAILABLE_ICONS.find(i => i.name === categoryForm.icon)?.label || 'Klasör'}
              </Text>
            </View>
            <MaterialIcons name="arrow-drop-down" size={24} color="#2C3E50" />
          </TouchableOpacity>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Not Eklenebilir</Text>
            <TouchableOpacity
              style={[styles.switch, categoryForm.hasNotes && styles.switchActive]}
              onPress={() => setCategoryForm(prev => ({ ...prev, hasNotes: !prev.hasNotes }))}
            >
              <View style={[styles.switchThumb, categoryForm.hasNotes && styles.switchThumbActive]} />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={styles.buttonText}>İptal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.submitButton]}
              onPress={onSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  {isEditing ? 'Güncelle' : 'Ekle'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <Modal
            visible={showIconPicker}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowIconPicker(false)}
          >
            <View style={styles.iconPickerContainer}>
              <View style={styles.iconPickerContent}>
                <View style={styles.iconPickerHeader}>
                  <Text style={styles.iconPickerTitle}>İkon Seç</Text>
                  <TouchableOpacity 
                    onPress={() => setShowIconPicker(false)}
                    style={styles.closeButton}
                  >
                    <MaterialIcons name="close" size={24} color="#E74C3C" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.iconList}>
                  {AVAILABLE_ICONS.map((icon) => (
                    <TouchableOpacity
                      key={icon.name}
                      style={[
                        styles.iconOption,
                        categoryForm.icon === icon.name && styles.selectedIconOption
                      ]}
                      onPress={() => {
                        setCategoryForm(prev => ({ ...prev, icon: icon.name }));
                        setShowIconPicker(false);
                      }}
                    >
                      <MaterialIcons 
                        name={icon.name} 
                        size={24} 
                        color={categoryForm.icon === icon.name ? '#4A90E2' : '#2C3E50'} 
                      />
                      <Text style={[
                        styles.iconOptionText,
                        categoryForm.icon === icon.name && styles.selectedIconOptionText
                      ]}>
                        {icon.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2C3E50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  iconSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
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
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: '#2C3E50',
  },
  switch: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    backgroundColor: '#E2E8F0',
    padding: 2,
  },
  switchActive: {
    backgroundColor: '#4A90E2',
  },
  switchThumb: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: '#FFFFFF',
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#E2E8F0',
  },
  submitButton: {
    backgroundColor: '#4A90E2',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  iconPickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  iconPickerContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  iconPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconPickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  closeButton: {
    padding: 4,
  },
  iconList: {
    maxHeight: 400,
  },
  iconOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  selectedIconOption: {
    backgroundColor: '#F5F6FA',
  },
  iconOptionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#2C3E50',
  },
  selectedIconOptionText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
}); 