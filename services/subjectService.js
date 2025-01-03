import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs } from '@firebase/firestore';
import { db } from '../firebaseConfig/config';

export const subjectService = {
  // Konuları getir
  getSubjects: async (categoryId, examId) => {
    try {
      const subjectsRef = collection(db, "Kategoriler", categoryId, "Sinavlar", examId, "Konular");
      const snapshot = await getDocs(subjectsRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Konular alınırken hata:', error);
      throw error;
    }
  },

  // Yeni konu ekle
  addSubject: async (categoryId, examId, subjectData) => {
    try {
      const subjectsRef = collection(db, "Kategoriler", categoryId, "Sinavlar", examId, "Konular");
      const docRef = await addDoc(subjectsRef, subjectData);
      return docRef.id;
    } catch (error) {
      console.error('Konu eklenirken hata:', error);
      throw error;
    }
  },

  // Konuyu güncelle
  updateSubject: async (categoryId, examId, subjectId, subjectData) => {
    try {
      const subjectRef = doc(db, "Kategoriler", categoryId, "Sinavlar", examId, "Konular", subjectId);
      await updateDoc(subjectRef, subjectData);
    } catch (error) {
      console.error('Konu güncellenirken hata:', error);
      throw error;
    }
  },

  // Konuyu sil
  deleteSubject: async (categoryId, examId, subjectId) => {
    try {
      const subjectRef = doc(db, "Kategoriler", categoryId, "Sinavlar", examId, "Konular", subjectId);
      await deleteDoc(subjectRef);
    } catch (error) {
      console.error('Konu silinirken hata:', error);
      throw error;
    }
  }
}; 