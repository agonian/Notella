import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const NoteForm = ({
  form,
  setForm,
  onSubmit,
  onClose,
  isEditing,
}) => {
  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {isEditing ? 'Not Düzenle' : 'Yeni Not'}
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
            placeholder="Not Başlığı"
            value={form.title}
            onChangeText={(text) => setForm({ ...form, title: text })}
          />

          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Not Açıklaması"
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            multiline
          />

          <TouchableOpacity
            style={[
              styles.submitButton,
              !form.title.trim() && styles.submitButtonDisabled
            ]}
            onPress={onSubmit}
            disabled={!form.title.trim()}
          >
            <Text style={styles.submitButtonText}>
              {isEditing ? 'Güncelle' : 'Ekle'}
            </Text>
          </TouchableOpacity>
        </View>
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
});

export default NoteForm; 