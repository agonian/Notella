import { db } from '../firebaseConfig/config';
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, updateDoc, deleteDoc, writeBatch, orderBy } from '@firebase/firestore';
import { logger } from '../utils/logger';

export const loadCategories = async () => {
  try {
    const q = query(
      collection(db, 'categories'),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    const categoriesData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));

    // Kategorileri ağaç yapısına dönüştür
    const buildTree = (categories, parentId = null) => {
      return categories
        .filter(cat => cat.parentId === parentId)
        .sort((a, b) => {
          const orderDiff = (a.order || 0) - (b.order || 0);
          if (orderDiff !== 0) return orderDiff;
          return (a.createdAt || 0) - (b.createdAt || 0);
        })
        .map(cat => ({
          ...cat,
          children: buildTree(categories, cat.id)
        }));
    };

    const tree = buildTree(categoriesData);
    logger.log('Kategoriler yüklendi:', { count: categoriesData.length });
    return tree;
  } catch (error) {
    logger.error('Kategoriler yüklenirken hata:', error);
    throw error;
  }
};

export const addCategory = async (categoryData) => {
  try {
    const data = {
      ...categoryData,
      order: categoryData.order || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'categories'), data);
    logger.log('Yeni kategori eklendi:', { id: docRef.id });
    return docRef.id;
  } catch (error) {
    logger.error('Kategori eklenirken hata:', error);
    throw error;
  }
};

export const updateCategory = async (categoryId, categoryData) => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    await updateDoc(categoryRef, {
      ...categoryData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Kategori güncellenirken hata:', error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    // Önce alt kategorileri bul
    const q = query(collection(db, 'categories'), where('parentId', '==', categoryId));
    const snapshot = await getDocs(q);
    
    // Batch işlemi başlat
    const batch = writeBatch(db);
    
    // Alt kategorileri sil
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Ana kategoriyi sil
    const categoryRef = doc(db, 'categories', categoryId);
    batch.delete(categoryRef);
    
    // Batch işlemini uygula
    await batch.commit();
  } catch (error) {
    console.error('Kategori silinirken hata:', error);
    throw error;
  }
};

export const getFlatNotableCategories = (categories, parentPath = '') => {
  let result = [];
  categories.forEach(category => {
    const currentPath = parentPath ? `${parentPath} > ${category.name}` : category.name;
    if (category.hasNotes) {
      result.push({ ...category, path: currentPath });
    }
    if (category.children && category.children.length > 0) {
      result = result.concat(getFlatNotableCategories(category.children, currentPath));
    }
  });
  return result;
};

export const getFilteredCategories = (categories, searchText) => {
  if (!searchText) return categories;

  const filterCategory = (category) => {
    const matchesSearch = category.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchText.toLowerCase()));

    if (matchesSearch) {
      // Eğer kategori eşleşiyorsa, tüm alt kategorileriyle birlikte ekle
      return {
        ...category,
        children: category.children ? category.children.filter(filterCategory) : []
      };
    }

    if (category.children && category.children.length > 0) {
      // Eğer alt kategorilerde eşleşme varsa, kategoriyi de ekle
      const filteredChildren = category.children.filter(filterCategory);
      if (filteredChildren.length > 0) {
        return {
          ...category,
          children: filteredChildren
        };
      }
    }

    return null;
  };

  return categories.map(filterCategory).filter(Boolean);
}; 