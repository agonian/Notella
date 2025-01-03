import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView } from 'react-native';
import { categoryService } from '../services/categoryService';
import { MaterialIcons } from '@expo/vector-icons';

export default function AdminScreen() {
  const [loading, setLoading] = useState(false);

  const handleInitializeCategories = async () => {
    try {
      setLoading(true);
      await categoryService.addInitialCategories();
      Alert.alert('Başarılı', 'Aşağıdaki kategoriler eklendi:\n\n• Bilişim ve Teknoloji\n• Okul Dersleri\n• Rehberlik\n• Sınav Hazırlık');
    } catch (error) {
      Alert.alert('Hata', 'Kategoriler eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSampleExams = async () => {
    try {
      setLoading(true);
      await categoryService.addSampleExamsForSchoolCategory();
      Alert.alert('Başarılı', 'Okul Dersleri kategorisine aşağıdaki dersler eklendi:\n\n• Matematik\n• Fizik\n• Kimya');
    } catch (error) {
      Alert.alert('Hata', 'Sınavlar eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSampleSubjects = async () => {
    try {
      setLoading(true);
      await categoryService.addSampleSubjectsForMath();
      Alert.alert('Başarılı', 'Matematik dersine aşağıdaki konular eklendi:\n\n• Sayılar\n• Cebir\n• Geometri');
    } catch (error) {
      Alert.alert('Hata', 'Konular eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const CategoryPreview = ({ title, items, icon }) => (
    <View style={styles.previewCard}>
      <View style={styles.previewHeader}>
        <MaterialIcons name={icon} size={24} color="#4A90E2" />
        <Text style={styles.previewTitle}>{title}</Text>
      </View>
      {items.map((item, index) => (
        <View key={index} style={styles.previewItem}>
          <MaterialIcons name="chevron-right" size={20} color="#7F8C8D" />
          <Text style={styles.previewItemText}>{item}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Yönetim Paneli</Text>
        <Text style={styles.subtitle}>Kategori ve İçerik Yönetimi</Text>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={async () => {
            try {
              setLoading(true);
              await categoryService.resetAndInitializeCategories();
              Alert.alert('Başarılı', 'Tüm kategoriler sıfırlandı ve yeniden oluşturuldu');
            } catch (error) {
              Alert.alert('Hata', 'Kategoriler sıfırlanırken bir hata oluştu');
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Kategorileri Sıfırla ve Yeniden Oluştur</Text>
        </TouchableOpacity>

        <CategoryPreview
          title="Ana Kategoriler"
          icon="category"
          items={[
            'Bilişim ve Teknoloji',
            'Okul Dersleri',
            'Rehberlik',
            'Sınav Hazırlık'
          ]}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleInitializeCategories}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Ana Kategorileri Ekle</Text>
        </TouchableOpacity>

        <CategoryPreview
          title="Okul Dersleri - Örnek Dersler"
          icon="school"
          items={[
            'Matematik',
            'Fizik',
            'Kimya'
          ]}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAddSampleExams}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Örnek Dersleri Ekle</Text>
        </TouchableOpacity>

        <CategoryPreview
          title="Matematik - Örnek Konular"
          icon="functions"
          items={[
            'Sayılar',
            'Cebir',
            'Geometri'
          ]}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAddSampleSubjects}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Örnek Konuları Ekle</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  content: {
    padding: 20,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#95A5A6',
  },
  resetButton: {
    backgroundColor: '#E74C3C',
    marginBottom: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  previewItemText: {
    fontSize: 16,
    color: '#34495E',
    marginLeft: 8,
  },
}); 