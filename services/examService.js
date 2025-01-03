import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs } from '@firebase/firestore';
import { db } from '../firebaseConfig/config';

export const examService = {
  // Sınavları getir
  getExams: async (categoryId) => {
    try {
      const examsRef = collection(db, "Kategoriler", categoryId, "Sinavlar");
      const snapshot = await getDocs(examsRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Sınavlar alınırken hata:', error);
      throw error;
    }
  },

  // Yeni sınav ekle
  addExam: async (categoryId, examData) => {
    try {
      const examsRef = collection(db, "Kategoriler", categoryId, "Sinavlar");
      const docRef = await addDoc(examsRef, examData);
      return docRef.id;
    } catch (error) {
      console.error('Sınav eklenirken hata:', error);
      throw error;
    }
  },

  // Sınavı güncelle
  updateExam: async (categoryId, examId, examData) => {
    try {
      const examRef = doc(db, "Kategoriler", categoryId, "Sinavlar", examId);
      await updateDoc(examRef, examData);
    } catch (error) {
      console.error('Sınav güncellenirken hata:', error);
      throw error;
    }
  },

  // Sınavı sil
  deleteExam: async (categoryId, examId) => {
    try {
      const examRef = doc(db, "Kategoriler", categoryId, "Sinavlar", examId);
      await deleteDoc(examRef);
    } catch (error) {
      console.error('Sınav silinirken hata:', error);
      throw error;
    }
  }
}; 