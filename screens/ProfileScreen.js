import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { auth, db } from '../firebaseConfig/config';
import { getCurrentUserRole } from '../services/authService';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    role: '',
    joinDate: '',
    profileImage: null,
  });
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalCategories: 0,
    studyTime: '0',
    lastActive: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserInfo();
    loadUserStats();
  }, []);

  const loadUserInfo = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const role = await getCurrentUserRole();
        const joinDate = new Date(user.metadata.creationTime).toLocaleDateString('tr-TR');
        
        setUserInfo({
          name: user.displayName || user.email.split('@')[0],
          email: user.email,
          role: role,
          joinDate: joinDate,
          profileImage: user.photoURL,
        });
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri yüklenirken hata:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      // Not: Bu değerler şu an için örnek verilerdir.
      // İleride Firebase entegrasyonu ile gerçek veriler gösterilecektir.
      setStats({
        totalNotes: 0,           // Kullanıcının toplam not sayısı
        totalCategories: 0,      // Erişilebilir kategori sayısı
        studyTime: '0 saat',     // Toplam çalışma süresi
        lastActive: new Date().toLocaleDateString('tr-TR'), // Son giriş tarihi
      });
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    Alert.alert(
      'Bilgi',
      'Profil fotoğrafı değiştirme özelliği şu an için kullanılamıyor.',
      [{ text: 'Tamam', style: 'default' }]
    );
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin':
        return 'Yönetici';
      case 'teacher':
        return 'Öğretmen';
      case 'user':
        return 'Öğrenci';
      default:
        return 'Kullanıcı';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#4A90E2', '#50C878']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={handleImagePick} style={styles.profileImageContainer}>
            {userInfo.profileImage ? (
              <Image source={{ uri: userInfo.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <MaterialIcons name="person" size={40} color="#FFFFFF" />
              </View>
            )}
            <View style={styles.editIconContainer}>
              <MaterialIcons name="edit" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.name}>{userInfo.name}</Text>
          <View style={styles.roleBadge}>
            <MaterialIcons 
              name={userInfo.role === 'admin' ? 'admin-panel-settings' : 'person'} 
              size={16} 
              color="#FFFFFF" 
            />
            <Text style={styles.roleText}>{getRoleText(userInfo.role)}</Text>
          </View>
        </LinearGradient>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="note" size={24} color="#4A90E2" />
            <Text style={styles.statNumber}>{stats.totalNotes}</Text>
            <Text style={styles.statLabel}>Not</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="category" size={24} color="#50C878" />
            <Text style={styles.statNumber}>{stats.totalCategories}</Text>
            <Text style={styles.statLabel}>Kategori</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="timer" size={24} color="#E74C3C" />
            <Text style={styles.statNumber}>{stats.studyTime}</Text>
            <Text style={styles.statLabel}>Çalışma</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap Bilgileri</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialIcons name="email" size={20} color="#4A90E2" />
              <Text style={styles.infoText}>{userInfo.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="calendar-today" size={20} color="#4A90E2" />
              <Text style={styles.infoText}>Katılım: {userInfo.joinDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="access-time" size={20} color="#4A90E2" />
              <Text style={styles.infoText}>Son Giriş: {stats.lastActive}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.editButton}>
          <MaterialIcons name="edit" size={20} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Profili Düzenle</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#4A90E2',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  roleText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: -30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 