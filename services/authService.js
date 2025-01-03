import { auth, db } from '../firebaseConfig/config';
import { doc, getDoc, setDoc } from '@firebase/firestore';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from '@firebase/auth';

export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  USER: 'user'
};

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Kullanıcı dokümanını kontrol et, yoksa oluştur
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        email: user.email,
        role: USER_ROLES.USER,
        createdAt: new Date()
      });
    }
    
    return user;
  } catch (error) {
    console.error('Giriş hatası:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Çıkış hatası:', error);
    throw error;
  }
};

export const createUserWithRole = async (email, password, role) => {
  try {
    // Firebase Authentication'da kullanıcı oluştur
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Firestore'da kullanıcı dokümanı oluştur
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: role,
      createdAt: new Date()
    });

    return user;
  } catch (error) {
    console.error('Kullanıcı oluşturulurken hata:', error);
    throw error;
  }
};

export const getCurrentUserRole = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      return userDoc.data().role;
    }
    return null;
  } catch (error) {
    console.error('Kullanıcı rolü alınırken hata:', error);
    throw error;
  }
};

export const hasPermission = async (requiredRole) => {
  try {
    const currentRole = await getCurrentUserRole();
    if (!currentRole) return false;

    switch (requiredRole) {
      case USER_ROLES.USER:
        return true; // Tüm roller erişebilir
      case USER_ROLES.TEACHER:
        return currentRole === USER_ROLES.TEACHER || currentRole === USER_ROLES.ADMIN;
      case USER_ROLES.ADMIN:
        return currentRole === USER_ROLES.ADMIN;
      default:
        return false;
    }
  } catch (error) {
    console.error('Yetki kontrolü yapılırken hata:', error);
    return false;
  }
};

// Auth durumu değişikliklerini dinle
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};