import { auth, db } from '../firebaseConfig/config';
import { doc, getDoc, setDoc, onSnapshot } from '@firebase/firestore';
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
    // Çıkış başarılı, auth state değişecek ve App.js'deki callback tetiklenecek
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
    console.error('Rol getirme hatası:', error);
    return null;
  }
};

export const getCurrentUsername = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      return userDoc.data().username;
    }
    return null;
  } catch (error) {
    console.error('Username getirme hatası:', error);
    return null;
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
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('Kullanıcı oturum açtı:', { userId: user.uid });
    } else {
      console.log('Kullanıcı oturumu kapandı');
    }
    callback(user);
  });
};

export const subscribeToUserData = (userId, callback) => {
  if (!userId) return null;
  
  const userDocRef = doc(db, 'users', userId);
  return onSnapshot(userDocRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};