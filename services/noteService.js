import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs } from '@firebase/firestore';
import { db } from '../firebaseConfig/config';

export const noteService = {
  // Notları getir
  getSubjectNotes: async (categoryId, examId, subjectId) => {
    try {
      const notesRef = collection(db, "Kategoriler", categoryId, "Sinavlar", examId, "Konular", subjectId, "Notlar");
      const snapshot = await getDocs(notesRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Notlar alınırken hata:', error);
      throw error;
    }
  },

  // Yeni not ekle
  addNote: async (categoryId, examId, subjectId, noteData) => {
    try {
      const notesRef = collection(db, "Kategoriler", categoryId, "Sinavlar", examId, "Konular", subjectId, "Notlar");
      const docRef = await addDoc(notesRef, {
        ...noteData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Not eklenirken hata:', error);
      throw error;
    }
  },

  // Notu güncelle
  updateNote: async (categoryId, examId, subjectId, noteId, noteData) => {
    try {
      const noteRef = doc(db, "Kategoriler", categoryId, "Sinavlar", examId, "Konular", subjectId, "Notlar", noteId);
      await updateDoc(noteRef, {
        ...noteData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Not güncellenirken hata:', error);
      throw error;
    }
  },

  // Notu sil
  deleteNote: async (categoryId, examId, subjectId, noteId) => {
    try {
      const noteRef = doc(db, "Kategoriler", categoryId, "Sinavlar", examId, "Konular", subjectId, "Notlar", noteId);
      await deleteDoc(noteRef);
    } catch (error) {
      console.error('Not silinirken hata:', error);
      throw error;
    }
  }
}; 