import { 
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  writeBatch
} from '@firebase/firestore';
import { db, auth } from '../firebaseConfig/config';
import { hasPermission, USER_ROLES } from './authService';

// Kategori oluşturma (sadece admin)
export const createCategory = async (categoryData) => {
  const canCreate = await hasPermission(USER_ROLES.ADMIN);
  if (!canCreate) {
    throw new Error('Bu işlem için yetkiniz yok');
  }

  const user = auth.currentUser;
  const newCategory = {
    ...categoryData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: user.uid
  };

  return addDoc(collection(db, 'Kategoriler'), newCategory);
};

// Alt kategori oluşturma (sadece admin)
export const createSubcategory = async (categoryId, subcategoryData) => {
  const canCreate = await hasPermission(USER_ROLES.ADMIN);
  if (!canCreate) {
    throw new Error('Bu işlem için yetkiniz yok');
  }

  const user = auth.currentUser;
  const newSubcategory = {
    ...subcategoryData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: user.uid
  };

  return addDoc(
    collection(db, 'Kategoriler', categoryId, 'Sinavlar'),
    newSubcategory
  );
};

// Kategorileri getir (tüm kullanıcılar)
export const getCategories = async () => {
  const q = query(
    collection(db, 'Kategoriler'),
    orderBy('order', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Alt kategorileri getir (tüm kullanıcılar)
export const getSubcategories = async (categoryId) => {
  const q = query(
    collection(db, 'Kategoriler', categoryId, 'Sinavlar'),
    orderBy('order', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Kategori güncelleme (sadece admin)
export const updateCategory = async (categoryId, updateData) => {
  const canUpdate = await hasPermission(USER_ROLES.ADMIN);
  if (!canUpdate) {
    throw new Error('Bu işlem için yetkiniz yok');
  }

  return updateDoc(doc(db, 'Kategoriler', categoryId), {
    ...updateData,
    updatedAt: serverTimestamp()
  });
};

// Alt kategori güncelleme (sadece admin)
export const updateSubcategory = async (categoryId, subcategoryId, updateData) => {
  const canUpdate = await hasPermission(USER_ROLES.ADMIN);
  if (!canUpdate) {
    throw new Error('Bu işlem için yetkiniz yok');
  }

  return updateDoc(
    doc(db, 'Kategoriler', categoryId, 'Sinavlar', subcategoryId),
    {
      ...updateData,
      updatedAt: serverTimestamp()
    }
  );
};

// Kategori silme (sadece admin)
export const deleteCategory = async (categoryId) => {
  const canDelete = await hasPermission(USER_ROLES.ADMIN);
  if (!canDelete) {
    throw new Error('Bu işlem için yetkiniz yok');
  }

  // Önce alt kategorileri sil
  const subcategoriesSnapshot = await getDocs(
    collection(db, 'Kategoriler', categoryId, 'Sinavlar')
  );

  const batch = writeBatch(db);
  subcategoriesSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  // Sonra kategoriyi sil
  batch.delete(doc(db, 'Kategoriler', categoryId));
  
  return batch.commit();
}; 