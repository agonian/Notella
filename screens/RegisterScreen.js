import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { auth, db } from '../firebaseConfig/config';
import { createUserWithEmailAndPassword } from '@firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from '@firebase/firestore';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Username kontrolü
  const checkUsername = async (username) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const q = query(collection(db, 'users'), where('username', '==', username));
      const querySnapshot = await getDocs(q);
      setUsernameAvailable(querySnapshot.empty);
    } catch (error) {
      console.error('Username kontrol hatası:', error);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !username) {
      Alert.alert('Uyarı', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (!usernameAvailable) {
      Alert.alert('Uyarı', 'Bu kullanıcı adı zaten kullanımda.');
      return;
    }

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Kullanıcı bilgilerini Firestore'a kaydet
      await setDoc(doc(db, 'users', user.uid), {
        email: email,
        username: username,
        role: 'user',
        createdAt: new Date(),
      });

      Alert.alert('Başarılı', 'Kayıt işlemi tamamlandı.');
    } catch (error) {
      console.error('Kayıt hatası:', error);
      Alert.alert('Hata', 'Kayıt işlemi sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Kayıt Ol</Text>

        {/* Username Input */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="person" size={24} color="#95A5A6" />
          <TextInput
            style={styles.input}
            placeholder="Kullanıcı Adı"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              checkUsername(text);
            }}
          />
          {checkingUsername ? (
            <ActivityIndicator size="small" color="#4A90E2" />
          ) : username.length >= 3 && (
            <MaterialIcons 
              name={usernameAvailable ? "check-circle" : "error"} 
              size={24} 
              color={usernameAvailable ? "#27AE60" : "#E74C3C"} 
            />
          )}
        </View>
        {username.length >= 3 && (
          <Text style={[
            styles.usernameStatus,
            { color: usernameAvailable ? "#27AE60" : "#E74C3C" }
          ]}>
            {usernameAvailable ? "Kullanıcı adı uygun" : "Bu kullanıcı adı kullanımda"}
          </Text>
        )}

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={24} color="#95A5A6" />
          <TextInput
            style={styles.input}
            placeholder="E-posta"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="lock" size={24} color="#95A5A6" />
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={handleRegister}
          disabled={loading || !usernameAvailable}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialIcons name="person-add" size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>Kayıt Ol</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginLinkText}>
            Zaten hesabın var mı? Giriş yap
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#2C3E50',
  },
  button: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loginLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#4A90E2',
    fontSize: 14,
  },
  usernameStatus: {
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
}); 