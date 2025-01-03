import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot } from '@firebase/firestore';
import { db, auth } from '../firebaseConfig/config';
import { examService } from '../services/examService';
import { subjectService } from '../services/subjectService';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    ad: '',
    aciklama: '',
    icon: 'folder'
  });
  const [stats, setStats] = useState({
    categories: 0,
    exams: 0,
    subjects: 0
  });

  // Kategorileri ve istatistikleri dinle
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "Kategoriler"),
      (snapshot) => {
        const categoriesData = [];
        snapshot.forEach((doc) => {
          categoriesData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setCategories(categoriesData);
        setStats(prev => ({ ...prev, categories: categoriesData.length }));
        setLoading(false);
      },
      (error) => {
        console.error('Kategoriler dinlenirken hata:', error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Seçili kategorinin sınavlarını getir
  useEffect(() => {
    if (selectedCategory) {
      const loadExams = async () => {
        try {
          const examsData = await examService.getExams(selectedCategory.id);
          setExams(examsData);
        } catch (error) {
          console.error('Sınavlar yüklenirken hata:', error);
        }
      };
      loadExams();
    }
  }, [selectedCategory]);

  // Seçili sınavın konularını getir
  useEffect(() => {
    if (selectedCategory && selectedExam) {
      const loadSubjects = async () => {
        try {
          const subjectsData = await subjectService.getSubjects(selectedCategory.id, selectedExam.id);
          setSubjects(subjectsData);
        } catch (error) {
          console.error('Konular yüklenirken hata:', error);
        }
      };
      loadSubjects();
    }
  }, [selectedCategory, selectedExam]);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      ad: '',
      aciklama: '',
      icon: 'folder'
    });
    setModalVisible(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      ad: item.ad || '',
      aciklama: item.aciklama || '',
      icon: item.icon || 'folder'
    });
    setModalVisible(true);
  };

  const handleDelete = async (item) => {
    Alert.alert(
      "Silme Onayı",
      "Bu öğeyi silmek istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { 
          text: "Sil", 
          style: "destructive",
          onPress: async () => {
            try {
              if (activeTab === 'categories') {
                await deleteDoc(doc(db, "Kategoriler", item.id));
              } else if (activeTab === 'exams' && selectedCategory) {
                await examService.deleteExam(selectedCategory.id, item.id);
              } else if (activeTab === 'subjects' && selectedCategory && selectedExam) {
                await subjectService.deleteSubject(selectedCategory.id, selectedExam.id, item.id);
              }
            } catch (error) {
              console.error('Silme hatası:', error);
              Alert.alert('Hata', 'Silme işlemi başarısız oldu.');
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    try {
      if (activeTab === 'categories') {
        if (editingItem) {
          await updateDoc(doc(db, "Kategoriler", editingItem.id), formData);
        } else {
          await addDoc(collection(db, "Kategoriler"), formData);
        }
      } else if (activeTab === 'exams' && selectedCategory) {
        if (editingItem) {
          await examService.updateExam(selectedCategory.id, editingItem.id, formData);
        } else {
          await examService.addExam(selectedCategory.id, formData);
        }
      } else if (activeTab === 'subjects' && selectedCategory && selectedExam) {
        if (editingItem) {
          await subjectService.updateSubject(selectedCategory.id, selectedExam.id, editingItem.id, formData);
        } else {
          await subjectService.addSubject(selectedCategory.id, selectedExam.id, formData);
        }
      }
      setModalVisible(false);
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      Alert.alert('Hata', 'Kaydetme işlemi başarısız oldu.');
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedExam(null);
    setActiveTab('exams');
  };

  const handleExamSelect = (exam) => {
    setSelectedExam(exam);
    setActiveTab('subjects');
  };

  const renderBreadcrumb = () => (
    <View style={styles.breadcrumb}>
      <TouchableOpacity 
        onPress={() => {
          setActiveTab('categories');
          setSelectedCategory(null);
          setSelectedExam(null);
        }}
        style={styles.breadcrumbItem}
      >
        <Text style={styles.breadcrumbText}>Kategoriler</Text>
      </TouchableOpacity>
      
      {selectedCategory && (
        <>
          <MaterialIcons name="chevron-right" size={20} color="#7F8C8D" />
          <TouchableOpacity 
            onPress={() => {
              setActiveTab('exams');
              setSelectedExam(null);
            }}
            style={styles.breadcrumbItem}
          >
            <Text style={styles.breadcrumbText}>{selectedCategory.ad}</Text>
          </TouchableOpacity>
        </>
      )}
      
      {selectedExam && (
        <>
          <MaterialIcons name="chevron-right" size={20} color="#7F8C8D" />
          <TouchableOpacity 
            onPress={() => setActiveTab('subjects')}
            style={styles.breadcrumbItem}
          >
            <Text style={styles.breadcrumbText}>{selectedExam.ad}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderItem = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.itemCard}
      onPress={() => {
        if (activeTab === 'categories') handleCategorySelect(item);
        else if (activeTab === 'exams') handleExamSelect(item);
      }}
    >
      <View style={styles.itemContent}>
        <MaterialIcons name={item.icon || 'folder'} size={24} color="#2C3E50" />
        <View style={styles.itemText}>
          <Text style={styles.itemTitle}>{item.ad || item.id}</Text>
          <Text style={styles.itemDescription}>{item.aciklama || 'Açıklama yok'}</Text>
        </View>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
          <MaterialIcons name="edit" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionButton}>
          <MaterialIcons name="delete" size={20} color="#E74C3C" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (activeTab === 'categories') {
      return categories.map(renderItem);
    } else if (activeTab === 'exams' && selectedCategory) {
      return exams.map(renderItem);
    } else if (activeTab === 'subjects' && selectedCategory && selectedExam) {
      return subjects.map(renderItem);
    }
    return null;
  };

  // Dashboard içeriği
  const renderDashboard = () => (
    <View style={styles.dashboardContainer}>
      <View style={styles.welcomeSection}>
        <MaterialIcons name="admin-panel-settings" size={50} color="#4A90E2" />
        <Text style={styles.welcomeText}>Hoş Geldiniz, Admin!</Text>
        <Text style={styles.adminEmail}>{auth.currentUser?.email}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialIcons name="category" size={30} color="#4A90E2" />
          <Text style={styles.statNumber}>{stats.categories}</Text>
          <Text style={styles.statLabel}>Kategori</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialIcons name="school" size={30} color="#50C878" />
          <Text style={styles.statNumber}>{exams.length}</Text>
          <Text style={styles.statLabel}>Sınav</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialIcons name="subject" size={30} color="#E74C3C" />
          <Text style={styles.statNumber}>{subjects.length}</Text>
          <Text style={styles.statLabel}>Konu</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#4A90E2' }]}
            onPress={() => setActiveTab('categories')}
          >
            <MaterialIcons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Yeni Kategori</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#50C878' }]}
            onPress={() => {
              if (categories.length > 0) {
                setSelectedCategory(categories[0]);
                setActiveTab('exams');
              } else {
                Alert.alert('Uyarı', 'Önce kategori eklemelisiniz.');
              }
            }}
          >
            <MaterialIcons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Yeni Sınav</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={40} color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
          onPress={() => setActiveTab('dashboard')}
        >
          <MaterialIcons 
            name="dashboard" 
            size={24} 
            color={activeTab === 'dashboard' ? '#4A90E2' : '#7F8C8D'} 
          />
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'categories' && styles.activeTab]}
          onPress={() => setActiveTab('categories')}
        >
          <MaterialIcons 
            name="category" 
            size={24} 
            color={activeTab === 'categories' ? '#4A90E2' : '#7F8C8D'} 
          />
          <Text style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>
            Kategoriler
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'dashboard' ? renderDashboard() : renderContent()}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleAdd}>
        <MaterialIcons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Düzenle' : 'Yeni Ekle'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Ad"
              value={formData.ad}
              onChangeText={(text) => setFormData({...formData, ad: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Açıklama"
              value={formData.aciklama}
              onChangeText={(text) => setFormData({...formData, aciklama: text})}
              multiline
            />
            
            <TextInput
              style={styles.input}
              placeholder="İkon (MaterialIcons)"
              value={formData.icon}
              onChangeText={(text) => setFormData({...formData, icon: text})}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={[styles.buttonText, styles.saveButtonText]}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbText: {
    fontSize: 16,
    color: '#4A90E2',
    marginHorizontal: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemText: {
    marginLeft: 12,
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  itemDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#E74C3C',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  dashboardContainer: {
    padding: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 10,
  },
  adminEmail: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 5,
  },
  quickActions: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4A90E2',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#7F8C8D',
  },
  activeTabText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
}); 