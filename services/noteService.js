import { db, auth } from '../firebaseConfig/config';
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, updateDoc, deleteDoc, orderBy, getDoc } from '@firebase/firestore';
import { logger } from '../utils/logger';
import { updateNoteCounts } from './categoryService';

// Notları getir
export const getNotes = async (categoryId) => {
  try {
    const q = query(
      collection(db, 'notes'),
      where('categoryId', '==', categoryId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));
  } catch (error) {
    logger.error('Notlar yüklenirken hata:', error);
    throw error;
  }
};

// Not sayısını getir
export const getNoteCount = async (categoryId) => {
  try {
    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef,
      where('categoryId', '==', categoryId),
      where('authorId', '==', auth.currentUser.uid)
    );
    
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    logger.error('Not sayısı alınırken hata:', error);
    return 0;
  }
};

// Yeni not ekle
export const addNote = async (noteData) => {
  try {
    const data = {
      ...noteData,
      authorId: auth.currentUser.uid,
      authorName: auth.currentUser.displayName || 'Admin',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'notes'), data);
    // Not sayısını güncelle
    updateNoteCounts(data, true);
    logger.log('Yeni not eklendi:', { id: docRef.id });
    return { id: docRef.id, ...data };
  } catch (error) {
    logger.error('Not eklenirken hata:', error);
    throw error;
  }
};

// Notu güncelle
export const updateNote = async (noteId, noteData) => {
  try {
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
      ...noteData,
      updatedAt: serverTimestamp(),
    });
    logger.log('Not güncellendi:', { id: noteId });
  } catch (error) {
    logger.error('Not güncellenirken hata:', error);
    throw error;
  }
};

// Notu sil
export const deleteNote = async (noteId) => {
  try {
    // Notu silmeden önce kategori bilgisini al
    const noteRef = doc(db, 'notes', noteId);
    const noteSnapshot = await getDoc(noteRef);
    const noteData = noteSnapshot.data();

    // Notu sil
    await deleteDoc(noteRef);
    
    // Not sayısını güncelle
    if (noteData) {
      updateNoteCounts(noteData, false);
    }
    
    logger.log('Not silindi:', { id: noteId });
  } catch (error) {
    logger.error('Not silinirken hata:', error);
    throw error;
  }
}; 