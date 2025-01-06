import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { DrawerItemList } from '@react-navigation/drawer';
import { auth } from '../firebaseConfig/config';
import { subscribeToUserData, USER_ROLES, signOut } from '../services/authService';

export default function CustomDrawerContent(props) {
  const [userEmail, setUserEmail] = useState('');
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    let unsubscribe = null;
    
    if (auth.currentUser) {
      setUserEmail(auth.currentUser.email);
      unsubscribe = subscribeToUserData(auth.currentUser.uid, (userData) => {
        setUsername(userData.username || '');
        setUserRole(userData.role || null);
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [auth.currentUser]);

  const getRoleText = (role) => {
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

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ 
        padding: 16,
        paddingTop: StatusBar.currentHeight + 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e1e1e1',
        backgroundColor: '#4A90E2',
      }}>
        <View style={{ 
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 10,
        }}>
          <MaterialIcons name="account-circle" size={50} color="#FFFFFF" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }} numberOfLines={1}>
              {username || 'Kullanıcı'}
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 14, opacity: 0.8 }} numberOfLines={1}>
              {userEmail}
            </Text>
            <View style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: 12,
              marginTop: 4,
              alignSelf: 'flex-start'
            }}>
              <MaterialIcons 
                name={userRole === USER_ROLES.ADMIN ? 'admin-panel-settings' : userRole === USER_ROLES.TEACHER ? 'school' : 'person'} 
                size={16} 
                color="#FFFFFF" 
              />
              <Text style={{ color: '#FFFFFF', marginLeft: 4, fontSize: 12 }}>{getRoleText(userRole)}</Text>
            </View>
          </View>
        </View>
      </View>
      <ScrollView style={{ flex: 1 }}>
        <DrawerItemList {...props} />
      </ScrollView>
      <TouchableOpacity 
        onPress={handleLogout}
        style={{
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: '#e1e1e1',
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}
      >
        <MaterialIcons name="logout" size={24} color="#E74C3C" />
        <Text style={{ marginLeft: 12, color: '#E74C3C', fontSize: 16 }}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
} 