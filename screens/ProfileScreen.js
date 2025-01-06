import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Modal
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { auth, db } from '../firebaseConfig/config';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from '@firebase/firestore';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUsername, setEditingUsername] = useState('');
  const [savingChanges, setSavingChanges] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setUserInfo(userDoc.data());
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri yüklenirken hata:', error);
      Alert.alert('Hata', 'Kullanıcı bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const checkUsername = async (username) => {
    if (!username || username.trim() === userInfo?.username) {
      setUsernameAvailable(true);
      return;
    }

    setCheckingUsername(true);
    try {
      const q = query(collection(db, 'users'), where('username', '==', username.trim()));
      const querySnapshot = await getDocs(q);
      setUsernameAvailable(querySnapshot.empty);
    } catch (error) {
      console.error('Username kontrol hatası:', error);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleEditProfile = () => {
    setEditingUsername(userInfo?.username || '');
    setUsernameAvailable(true);
    setEditModalVisible(true);
  };

  const handleSaveChanges = async () => {
    if (!editingUsername.trim()) {
      Alert.alert('Uyarı', 'Kullanıcı adı boş olamaz.');
      return;
    }

    if (!usernameAvailable) {
      Alert.alert('Uyarı', 'Bu kullanıcı adı zaten kullanımda.');
      return;
    }

    setSavingChanges(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        username: editingUsername.trim()
      });
      
      setUserInfo(prev => ({
        ...prev,
        username: editingUsername.trim()
      }));
      
      setEditModalVisible(false);
      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
    } finally {
      setSavingChanges(false);
    }
  };

  const handleImagePick = async () => {
    Alert.alert(
      'Profil Fotoğrafı',
      'Bu özellik şu anda geliştirme aşamasındadır.',
      [{ text: 'Tamam', style: 'default' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleImagePick} style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <MaterialIcons name="account-circle" size={80} color="#4A90E2" />
            <View style={styles.editIconContainer}>
              <MaterialIcons name="photo-camera" size={20} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>
        
        <Text style={styles.username}>{userInfo?.username || 'Kullanıcı'}</Text>
        <Text style={styles.email}>{auth.currentUser?.email}</Text>
        
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <MaterialIcons name="edit" size={20} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Profili Düzenle</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <MaterialIcons name="note" size={24} color="#4A90E2" />
          <Text style={styles.statValue}>24</Text>
          <Text style={styles.statLabel}>Not</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="folder" size={24} color="#4A90E2" />
          <Text style={styles.statValue}>8</Text>
          <Text style={styles.statLabel}>Kategori</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="access-time" size={24} color="#4A90E2" />
          <Text style={styles.statValue}>3 saat</Text>
          <Text style={styles.statLabel}>Çalışma</Text>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Profili Düzenle</Text>
            
            <View style={styles.inputContainer}>
              <MaterialIcons name="person" size={24} color="#95A5A6" />
              <TextInput
                style={styles.input}
                placeholder="Kullanıcı Adı"
                value={editingUsername}
                onChangeText={(text) => {
                  setEditingUsername(text);
                  checkUsername(text);
                }}
                autoCapitalize="none"
              />
              {checkingUsername ? (
                <ActivityIndicator size="small" color="#4A90E2" />
              ) : editingUsername.trim() !== userInfo?.username && (
                <MaterialIcons 
                  name={usernameAvailable ? "check-circle" : "error"} 
                  size={24} 
                  color={usernameAvailable ? "#27AE60" : "#E74C3C"} 
                />
              )}
            </View>
            {editingUsername.trim() !== userInfo?.username && !usernameAvailable && (
              <Text style={styles.usernameError}>
                Bu kullanıcı adı zaten kullanımda
              </Text>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
                disabled={savingChanges}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveChanges}
                disabled={savingChanges || !usernameAvailable}
              >
                {savingChanges ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Kaydet</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5F6FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4A90E2',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
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
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#2C3E50',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F6FA',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#7F8C8D',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  usernameError: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: -16,
    marginBottom: 16,
    marginLeft: 4,
  },
}); 