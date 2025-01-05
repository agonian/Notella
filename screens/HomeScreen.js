import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { auth } from '../firebaseConfig/config';
import { getCurrentUserRole, USER_ROLES } from '../services/authService';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [userRole, setUserRole] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        setLoading(true);
        if (auth.currentUser) {
          setUserEmail(auth.currentUser.email);
          const role = await getCurrentUserRole();
          setUserRole(role);
        }
      } catch (error) {
        console.error('Kullanıcı bilgileri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUserInfo();
  }, []);

  const getRoleText = (role) => {
    if (loading) return 'Yükleniyor...';
    
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'Yönetici';
      case USER_ROLES.TEACHER:
        return 'Öğretmen';
      case USER_ROLES.USER:
        return 'Öğrenci';
      default:
        return 'Bilinmeyen Rol';
    }
  };

  const renderRoleSpecificButtons = () => {
    const buttons = [];

    // Tüm roller için ortak butonlar
    buttons.push(
      <TouchableOpacity 
        key="categories"
        style={[styles.button, styles.mainButton]} 
        onPress={() => navigation.navigate('CategoriesScreen')}
      >
        <MaterialIcons name="library-books" size={24} color="#FFFFFF" />
        <Text style={styles.buttonText}>Notlara Göz At</Text>
      </TouchableOpacity>
    );

    // Öğretmen ve Admin için ek butonlar
    if (userRole === USER_ROLES.TEACHER || userRole === USER_ROLES.ADMIN) {
      buttons.push(
        <TouchableOpacity 
          key="manage-notes"
          style={[styles.button, styles.teacherButton]} 
          onPress={() => navigation.navigate('ManageNotes')}
        >
          <MaterialIcons name="edit" size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Not Yönetimi</Text>
        </TouchableOpacity>
      );
    }

    // Sadece Admin için ek butonlar
    if (userRole === USER_ROLES.ADMIN) {
      buttons.push(
        <TouchableOpacity 
          key="admin"
          style={[styles.button, styles.adminButton]}
          onPress={() => navigation.navigate('AdminPanel')}
        >
          <MaterialIcons name="admin-panel-settings" size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Yönetim Paneli</Text>
        </TouchableOpacity>
      );
    }

    return buttons;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#4A90E2', '#50C878']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Image
            source={require('../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Notella</Text>
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.userInfoContainer}>
            <MaterialIcons name="account-circle" size={50} color="#FFFFFF" />
            <Text style={styles.userEmail}>{userEmail}</Text>
            <View style={styles.roleBadge}>
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
              ) : (
                <MaterialIcons 
                  name={
                    userRole === USER_ROLES.ADMIN 
                      ? 'admin-panel-settings' 
                      : userRole === USER_ROLES.TEACHER 
                        ? 'school' 
                        : 'person'
                  } 
                  size={16} 
                  color="#FFFFFF" 
                />
              )}
              <Text style={styles.roleText}>{getRoleText(userRole)}</Text>
            </View>
          </View>

          <Text style={styles.welcomeText}>Hoş Geldiniz!</Text>
          <Text style={styles.subtitle}>Notella'da neler yapmak istersiniz?</Text>

          <View style={styles.buttonContainer}>
            {renderRoleSpecificButtons()}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: StatusBar.currentHeight + 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  userEmail: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 10,
    fontWeight: '500',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginTop: 8,
  },
  roleText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.9,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  mainButton: {
    backgroundColor: '#4A90E2',
  },
  teacherButton: {
    backgroundColor: '#50C878',
  },
  adminButton: {
    backgroundColor: '#E74C3C',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});
