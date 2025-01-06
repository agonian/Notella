import { db } from '../firebaseConfig/config';
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, updateDoc, deleteDoc } from '@firebase/firestore';
import { auth } from '../firebaseConfig/config';
import { logger } from '../utils/logger';

// Notları getir
export const getSubjectNotes = async (categoryId, examId, subjectId) => {
  try {
    const notesRef = collection(db, "Kategoriler", categoryId, "Sinavlar", examId, "Konular", subjectId, "Notlar");
    const snapshot = await getDocs(notesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    logger.error('Notlar alınırken hata:', error);
    throw error;
  }
};

// Yeni not ekle
export const addNote = async (noteData, categoryId, categoryName) => {
  try {
    const data = {
      title: noteData.title,
      description: noteData.description,
      categoryId: categoryId,
      categoryName: categoryName,
      authorId: auth.currentUser.uid,
      authorName: auth.currentUser.displayName || 'Admin',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'notes'), data);
    logger.log('Not eklendi:', { id: docRef.id });
    return docRef.id;
  } catch (error) {
    logger.error('Not eklenirken hata:', error);
    throw error;
  }
};

// Notu güncelle
export const updateNote = async (categoryId, examId, subjectId, noteId, noteData) => {
  try {
    const noteRef = doc(db, "Kategoriler", categoryId, "Sinavlar", examId, "Konular", subjectId, "Notlar", noteId);
    await updateDoc(noteRef, {
      ...noteData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    logger.error('Not güncellenirken hata:', error);
    throw error;
  }
};

// Notu sil
export const deleteNote = async (categoryId, examId, subjectId, noteId) => {
  try {
    const noteRef = doc(db, "Kategoriler", categoryId, "Sinavlar", examId, "Konular", subjectId, "Notlar", noteId);
    await deleteDoc(noteRef);
  } catch (error) {
    logger.error('Not silinirken hata:', error);
    throw error;
  }
}; 