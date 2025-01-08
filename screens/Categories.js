import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as categoryService from '../services/categoryService';
import { auth } from '../firebaseConfig/config';
import { collection, query, orderBy, onSnapshot, getDocs, where } from '@firebase/firestore';
import { db } from '../firebaseConfig/config';
import { getCurrentUsername } from '../services/authService';
import { logger } from '../utils/logger';

export default function Categories({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [greeting, setGreeting] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [username, setUsername] = useState('');
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [activeTime, setActiveTime] = useState(0);
  const [currentQuote, setCurrentQuote] = useState(null);

  useEffect(() => {
    loadCategories();
    loadUsername();
    setCurrentQuote(getMotivationalQuote());

    // Başlangıçta bir kez alıntı seç
    setCurrentQuote(getMotivationalQuote());

    // Firestore kategori dinleyicisi
    const categoryQuery = query(
      collection(db, 'categories'),
      orderBy('createdAt', 'asc')
    );

    // Firestore not dinleyicisi
    const noteQuery = query(
      collection(db, 'notes'),
      where('authorId', '==', auth.currentUser.uid)
    );
    
    // Her iki koleksiyonu da dinle
    const unsubscribeCategory = onSnapshot(categoryQuery, {
      next: async (snapshot) => {
        try {
          logger.log('Kategori değişikliği algılandı');
          const allCategories = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate()
          }));

          // Notları al ve not sayılarını hesapla
          const notesSnapshot = await getDocs(noteQuery);
          const noteCounts = {};
          notesSnapshot.docs.forEach(doc => {
            const note = doc.data();
            if (note.categoryId) {
              noteCounts[note.categoryId] = (noteCounts[note.categoryId] || 0) + 1;
            }
          });

          // Not sayılarıyla birlikte ağacı güncelle
          updateCategoryTree(allCategories, noteCounts);
        } catch (error) {
          logger.error('Kategori işleme hatası:', error);
          Alert.alert(
            'Hata',
            'Kategoriler işlenirken bir hata oluştu: ' + error.message
          );
        }
      },
      error: (error) => {
        logger.error('Firestore kategori dinleyici hatası:', error);
        Alert.alert(
          'Hata',
          'Kategoriler güncellenirken bir hata oluştu: ' + error.message
        );
      }
    });

    const unsubscribeNotes = onSnapshot(noteQuery, {
      next: async (snapshot) => {
        try {
          logger.log('Not değişikliği algılandı');
          const noteCounts = {};
          
          // Not sayılarını hesapla
          snapshot.docs.forEach(doc => {
            const note = doc.data();
            if (note.categoryId) {
              noteCounts[note.categoryId] = (noteCounts[note.categoryId] || 0) + 1;
            }
          });

          // Mevcut kategorileri al
          const categoriesSnapshot = await getDocs(categoryQuery);
          const allCategories = categoriesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate()
          }));

          // Not sayılarıyla birlikte ağacı güncelle
          updateCategoryTree(allCategories, noteCounts);
        } catch (error) {
          logger.error('Not işleme hatası:', error);
        }
      },
      error: (error) => {
        logger.error('Firestore not dinleyici hatası:', error);
      }
    });

    // Auth state değişikliğini dinle
    const authUnsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await loadUsername();
      } else {
        setUsername('Kullanıcı');
      }
    });

    // Aktif süre sayacı
    const timer = setInterval(() => {
      setActiveTime(prev => prev + 1);
    }, 1000);

    return () => {
      unsubscribeCategory();
      unsubscribeNotes();
      authUnsubscribe();
      clearInterval(timer);
    };
  }, []);

  // Kategori ağacını güncelleme fonksiyonu
  const updateCategoryTree = (categories, noteCounts = {}) => {
    // Üst kategorilerin not sayılarını hesapla
    const calculateParentNoteCounts = (categories) => {
      const getParentNoteCount = (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        if (!category) return 0;

        const directNoteCount = noteCounts[categoryId] || 0;
        const childCategories = categories.filter(c => c.parentId === categoryId);
        const childNoteCount = childCategories.reduce((sum, child) => 
          sum + getParentNoteCount(child.id), 0);

        noteCounts[categoryId] = directNoteCount + childNoteCount;
        return noteCounts[categoryId];
      };

      categories
        .filter(cat => !cat.parentId)
        .forEach(rootCat => getParentNoteCount(rootCat.id));
    };

    calculateParentNoteCounts(categories);
    
    // Ağacı oluştur
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
          noteCount: noteCounts[cat.id] || 0,
          children: buildTree(categories, cat.id)
        }));
    };

    const tree = buildTree(categories);
    setCategories(tree);
    
    // Arama durumunda filtrelemeyi uygula
    if (searchQuery) {
      const filtered = categoryService.getFilteredCategories(tree, searchQuery);
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(tree);
    }
    
    setLoading(false);
  };

  // Debounced arama fonksiyonu
  const handleSearch = useCallback((text) => {
    setSearchQuery(text);
    
    // Önceki timeout'u temizle
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // 300ms sonra aramayı gerçekleştir
    const timeoutId = setTimeout(() => {
      if (!text.trim()) {
        setFilteredCategories(categories);
      } else {
        const filtered = categoryService.getFilteredCategories(categories, text);
        setFilteredCategories(filtered);
      }
    }, 300);

    setSearchTimeout(timeoutId);
  }, [categories, searchTimeout]);

  // Component unmount olduğunda timeout'u temizle
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const loadUsername = async () => {
    const username = await getCurrentUsername();
    setUsername(username || 'Kullanıcı');
  };

  const formatActiveTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}s ${minutes}d ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}d ${secs}s`;
    }
    return `${secs}s`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { time: 'Günaydın', color: '#FF9800' };
    } else if (hour >= 12 && hour < 18) {
      return { time: 'İyi Günler', color: '#4CAF50' };
    } else {
      return { time: 'İyi Akşamlar', color: '#3F51B5' };
    }
  };

  const getMotivationalQuote = () => {
    const quotes = [
      { text: 'Bilgi güçtür.', author: 'Francis Bacon' },
      { text: 'Kendini bil.', author: 'Sokrates' },
      { text: 'Düşünüyorum, öyleyse varım.', author: 'Descartes' },
      { text: 'Bilgi en büyük hazinedir.', author: 'Aristoteles' },
      { text: 'Hayat, kendini keşfetme yolculuğudur.', author: 'Socrates' },
      { text: 'En yüksek başarı, asla durmamaktır.', author: 'Winston Churchill' },
      { text: 'Zaman en iyi öğretmendir.', author: 'Platon' },
      { text: 'Bilgelik, gerçeği aramaktır.', author: 'Cicero' },
      { text: 'Mutluluk, erdemi aramaktır.', author: 'Aristoteles' },
      { text: 'Değişim, hayatın tek değişmezidir.', author: 'Heraklitos' },
      { text: 'Bilgi, insanı özgür kılar.', author: 'Epiktetos' },
      { text: 'Hayat, yaşandığı gibi anlaşılır.', author: 'Søren Kierkegaard' },
      { text: 'İnsan, kendi kaderinin mimarıdır.', author: 'Sallust' },
      { text: 'Bilgelik, bilginin ötesindedir.', author: 'William James' },
      { text: 'Gerçek bilgelik, bilmediğini bilmektir.', author: 'Konfüçyus' },
      { text: 'Her şey akıştadır.', author: 'Heraklitos' },
      { text: 'Erdem, bilginin meyvesidir.', author: 'Sokrates' },
      { text: 'Yaşam, sürekli bir öğrenme sürecidir.', author: 'Aristoteles' },
      { text: 'Kendini yönetmeyi öğren.', author: 'Platon' },
      { text: 'Bilgelik, ruhun güneşidir.', author: 'Marcus Aurelius' },
      { text: 'Doğru düşünce, doğru eylemi getirir.', author: 'Marcus Aurelius' },
      { text: 'Bilgi, ışıktır.', author: 'Francis Bacon' },
      { text: 'Gerçek güç, kendini bilmektir.', author: 'Lao Tzu' },
      { text: 'Düşünceler eyleme dönüşür.', author: 'Ralph Waldo Emerson' },
      { text: 'Bilgelik, zamanın hediyesidir.', author: 'Seneca' },
      { text: 'Her son, yeni bir başlangıçtır.', author: 'Seneca' },
      { text: 'Yaşam, cesurların evidir.', author: 'Voltaire' },
      { text: 'Bilgi, özgürlüğün temelidir.', author: 'John Dewey' },
      { text: 'Gerçek güzellik, içsel bilgeliktedir.', author: 'Sokrates' },
      { text: 'Kendini geliştirmek, insanlığı geliştirmektir.', author: 'Konfüçyus' },
      { text: 'Bilgelik, deneyimin çocuğudur.', author: 'Leonardo da Vinci' },
      { text: 'Düşünce, eylemin tohumudur.', author: 'Ralph Waldo Emerson' },
      { text: 'Her gün yeni bir öğrenme fırsatıdır.', author: 'Platon' },
      { text: 'Bilgi, karanlığı aydınlatan ışıktır.', author: 'Francis Bacon' },
      { text: 'Kendini tanı, evreni tanı.', author: 'Sokrates' },
      { text: 'Yaşam, sürekli bir değişimdir.', author: 'Heraklitos' },
      { text: 'Bilgelik, ruhun gıdasıdır.', author: 'Cicero' },
      { text: 'Öğrenmek, yaşamın özüdür.', author: 'Aristoteles' },
      { text: 'Düşünce, varlığın aynasıdır.', author: 'Hegel' },
      { text: 'Bilgi, insanı yüceltir.', author: 'Francis Bacon' },
      { text: 'Her soru, yeni bir kapı açar.', author: 'Sokrates' },
      { text: 'Bilgelik, zamanın meyvesidir.', author: 'Aristoteles' },
      { text: 'Kendini bil, kendini aş.', author: 'Sokrates' },
      { text: 'Düşünce, eylemin rehberidir.', author: 'Ralph Waldo Emerson' },
      { text: 'Bilgi, güçtür; güç, sorumluluktur.', author: 'Francis Bacon' },
      { text: 'Her gün yeni bir başlangıçtır.', author: 'Seneca' },
      { text: 'Yaşam, öğrenmenin kendisidir.', author: 'John Dewey' },
      { text: 'Bilgelik, deneyimin ışığıdır.', author: 'Carl Jung' },
      { text: 'Kendini geliştir, dünyayı geliştir.', author: 'Konfüçyus' },
      { text: 'Düşünce, değişimin başlangıcıdır.', author: 'Platon' },
      { text: 'Her zorluk, bir fırsattır.', author: 'Albert Einstein' },
      { text: 'Bilgi, özgürlüğün anahtarıdır.', author: 'Miles Davis' },
      { text: 'Yaşam, cesaretle yaşanır.', author: 'Aristoteles' },
      { text: 'Düşünmek, var olmaktır.', author: 'Descartes' },
      { text: 'Her başarı, bir yolculuktur.', author: 'Ralph Waldo Emerson' },
      { text: 'Bilgelik, zamanın armağanıdır.', author: 'Sokrates' },
      { text: 'Kendini tanı, kendini sev.', author: 'Sokrates' },
      { text: 'Düşünce, eylemin öncüsüdür.', author: 'Thomas Edison' },
      { text: 'Bilgi, karanlığı aydınlatır.', author: 'Francis Bacon' },
      { text: 'Her gün yeni bir öğreti.', author: 'Konfüçyus' },
      { text: 'Yaşam, öğrenmenin kendisidir.', author: 'Leonardo da Vinci' },
      { text: 'Bilgelik, ruhun ışığıdır.', author: 'Platon' },
      { text: 'Kendini bil, dünyayı bil.', author: 'Sokrates' },
      { text: 'Düşünce, değişimin temelidir.', author: 'Albert Einstein' },
      { text: 'Her an yeni bir başlangıçtır.', author: 'Buddha' },
      { text: 'Bilgi, özgürlüğün yoludur.', author: 'Nelson Mandela' },
      { text: 'Yaşam, cesarettir.', author: 'Maya Angelou' },
      { text: 'Düşünmek, yaratmaktır.', author: 'Steve Jobs' },
      { text: 'Her deneyim, bir öğretidir.', author: 'Carl Jung' },
      { text: 'Bilgelik, zamanın sesidir.', author: 'Victor Hugo' },
      { text: 'Kendini tanı, kendini aş.', author: 'Friedrich Nietzsche' },
      { text: 'Düşünce, geleceğin tohumudur.', author: 'Ralph Waldo Emerson' },
      { text: 'Bilgi, güçtür; güç, değişimdir.', author: 'Michel Foucault' },
      { text: 'Her son, yeni bir başlangıçtır.', author: 'T.S. Eliot' },
      { text: 'Yaşam, öğrenmenin dansıdır.', author: 'Paulo Coelho' },
      { text: 'Bilgelik, deneyimin sesidir.', author: 'Carl Rogers' },
      { text: 'Kendini geliştir, dünyayı değiştir.', author: 'Mahatma Gandhi' },
      { text: 'Düşünce, eylemin kalbidir.', author: 'Martin Luther King Jr.' },
      { text: 'Her engel, bir fırsattır.', author: 'Winston Churchill' },
      { text: 'Bilgi, özgürlüğün dilidir.', author: 'Malcolm X' },
      { text: 'Yaşam, cesaretle güzeldir.', author: 'Anne Frank' },
      { text: 'Düşünmek, var olmaktır.', author: 'Hannah Arendt' },
      { text: 'Her adım, bir keşiftir.', author: 'Neil Armstrong' },
      { text: 'Bilgelik, zamanın şarkısıdır.', author: 'Bob Marley' },
      { text: 'Kendini tanı, kendini yenile.', author: 'Carl Jung' },
      { text: 'Düşünce, değişimin gücüdür.', author: 'Albert Einstein' },
      { text: 'Bilgi, karanlığın düşmanıdır.', author: 'Martin Luther King Jr.' },
      { text: 'Her gün yeni bir ufuktur.', author: 'Walt Whitman' },
      { text: 'Yaşam, öğrenmenin şiiridir.', author: 'Rumi' },
      { text: 'Bilgelik, ruhun müziğidir.', author: 'Khalil Gibran' },
      { text: 'Kendini bil, evreni keşfet.', author: 'Stephen Hawking' },
      { text: 'Düşünce, geleceğin anahtarıdır.', author: 'Nikola Tesla' },
      { text: 'Her yolculuk içsel bir keşiftir.', author: 'Joseph Campbell' },
      { text: 'Bilgi, özgürlüğün şarkısıdır.', author: 'Bob Dylan' },
      { text: 'Yaşam, cesaretin dansıdır.', author: 'Martha Graham' },
      { text: 'Düşünmek, yaratmaktır.', author: 'Marie Curie' },
      { text: 'Her an bir mucizedir.', author: 'Albert Einstein' },
      { text: 'Bilgelik, zamanın hediyesidir.', author: 'Oscar Wilde' },
      { text: 'Kendini tanı, dünyayı değiştir.', author: 'Che Guevara' },
      { text: 'Düşünce, eylemin ışığıdır.', author: 'Mahatma Gandhi' },
      { text: 'Bilgi, güçtür; güç, özgürlüktür.', author: 'Nelson Mandela' },
      { text: 'Her bitiş, yeni bir başlangıçtır.', author: 'Lao Tzu' },
      { text: 'Yaşam, öğrenmenin sanatıdır.', author: 'Vincent van Gogh' },
      { text: 'Bilgelik, deneyimin armağanıdır.', author: 'Maya Angelou' },
      { text: 'Kendini geliştir, insanlığı yücelt.', author: 'Mustafa Kemal Atatürk' }
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'categories'),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const allCategories = querySnapshot.docs.map(doc => ({
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

      const tree = buildTree(allCategories);
      logger.log('Kategoriler yüklendi:', { categoryCount: allCategories.length });
      setCategories(tree);
      setFilteredCategories(tree);
    } catch (error) {
      logger.error('Kategori yükleme hatası:', error);
      Alert.alert(
        'Hata',
        'Kategoriler yüklenirken bir hata oluştu: ' + error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const collapseAll = () => {
    // Eğer herhangi bir kategori açıksa, hepsini kapat
    if (expandedCategories.size > 0) {
      setExpandedCategories(new Set());
      setIsAllExpanded(false);
      return;
    }

    // Eğer tüm kategoriler kapalıysa, hepsini aç
    const allIds = new Set();
    const addAllCategoryIds = (categories) => {
      categories.forEach(category => {
        if (category.children && category.children.length > 0) {
          allIds.add(category.id);
          addAllCategoryIds(category.children);
        }
      });
    };
    addAllCategoryIds(categories);
    setExpandedCategories(allIds);
    setIsAllExpanded(true);
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleCategoryPress = async (category) => {
    if (category.hasNotes) {
      navigation.navigate('Notes', { 
        categoryId: category.id,
        categoryName: category.name
      });
    } else if (category.children && category.children.length > 0) {
      toggleCategory(category.id);
    } else {
      navigation.navigate('Subcategories', {
        categoryId: category.id,
        categoryName: category.name
      });
    }
  };

  const renderCategoryItem = (category, depth = 0) => {
    const paddingLeft = 16 + (depth * 20);
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    // Ana renkler
    const mainColors = [
      {
        text: '#3F51B5',  // İndigo
        bg: {
          0: '#FFFFFF',
          1: '#E8EAF6',
          2: '#C5CAE9',
          3: '#9FA8DA'
        }
      },
      {
        text: '#009688',  // Teal
        bg: {
          0: '#FFFFFF',
          1: '#E0F2F1',
          2: '#B2DFDB',
          3: '#80CBC4'
        }
      },
      {
        text: '#F44336',  // Kırmızı
        bg: {
          0: '#FFFFFF',
          1: '#FFEBEE',
          2: '#FFCDD2',
          3: '#EF9A9A'
        }
      },
      {
        text: '#FF9800',  // Turuncu
        bg: {
          0: '#FFFFFF',
          1: '#FFF3E0',
          2: '#FFE0B2',
          3: '#FFCC80'
        }
      },
      {
        text: '#673AB7',  // Mor
        bg: {
          0: '#FFFFFF',
          1: '#EDE7F6',
          2: '#D1C4E9',
          3: '#B39DDB'
        }
      },
      {
        text: '#2196F3',  // Mavi
        bg: {
          0: '#FFFFFF',
          1: '#E3F2FD',
          2: '#BBDEFB',
          3: '#90CAF9'
        }
      },
      {
        text: '#4CAF50',  // Yeşil
        bg: {
          0: '#FFFFFF',
          1: '#E8F5E9',
          2: '#C8E6C9',
          3: '#A5D6A7'
        }
      },
      {
        text: '#795548',  // Kahverengi
        bg: {
          0: '#FFFFFF',
          1: '#EFEBE9',
          2: '#D7CCC8',
          3: '#BCAAA4'
        }
      },
      {
        text: '#607D8B',  // Mavi Gri
        bg: {
          0: '#FFFFFF',
          1: '#ECEFF1',
          2: '#CFD8DC',
          3: '#B0BEC5'
        }
      },
      {
        text: '#E91E63',  // Pembe
        bg: {
          0: '#FFFFFF',
          1: '#FCE4EC',
          2: '#F8BBD0',
          3: '#F48FB1'
        }
      }
    ];

    // Kategori için renk şeması seç
    const getColorScheme = (category) => {
      // Varsayılan renk şeması (ilk renk)
      const defaultScheme = mainColors[0];

      if (depth === 0) {
        // Ana kategorinin index'ini bul
        const rootIndex = filteredCategories.findIndex(cat => cat.id === category.id);
        // Index'e göre renk seç (döngüsel olarak)
        return rootIndex >= 0 ? mainColors[rootIndex % mainColors.length] : defaultScheme;
      }

      // Alt kategoriler için üst kategorinin rengini bul
      const findRootIndex = (categories, categoryId) => {
        let rootIndex = -1;
        categories.forEach((cat, index) => {
          if (cat.id === categoryId) {
            rootIndex = index;
          } else if (cat.children) {
            const isChildOfThis = cat.children.some(child => 
              child.id === categoryId || 
              (child.children && findRootIndex([child], categoryId) >= 0)
            );
            if (isChildOfThis) {
              rootIndex = index;
            }
          }
        });
        return rootIndex;
      };

      const rootIndex = findRootIndex(filteredCategories, category.id);
      return rootIndex >= 0 ? mainColors[rootIndex % mainColors.length] : defaultScheme;
    };

    const scheme = getColorScheme(category);

    return (
      <View key={category.id}>
        <TouchableOpacity
          style={[
            styles.categoryItem,
            { paddingLeft, backgroundColor: scheme.bg[depth] || scheme.bg[3] },
            !category.hasNotes && styles.nonSelectableCategory
          ]}
          onPress={() => handleCategoryPress(category)}
        >
          {hasChildren && (
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => toggleCategory(category.id)}
            >
              <MaterialIcons
                name={isExpanded ? 'expand-more' : 'chevron-right'}
                size={24}
                color={depth === 0 ? scheme.text : "#2C3E50"}
              />
            </TouchableOpacity>
          )}
          
          <MaterialIcons
            name={category.icon || 'folder'}
            size={24}
            color={depth === 0 ? scheme.text : (category.hasNotes ? "#2C3E50" : "#95A5A6")}
            style={styles.categoryIcon}
          />
          
          <View style={styles.categoryContent}>
            <View style={styles.titleRow}>
              <Text style={[
                styles.categoryTitle,
                depth === 0 && { color: scheme.text, fontWeight: '700' },
                !category.hasNotes && styles.nonSelectableText
              ]}>
                {category.name}
              </Text>
              {category.noteCount > 0 && (
                <View style={[styles.badge, depth === 0 && { backgroundColor: scheme.text }]}>
                  <Text style={styles.badgeText}>{category.noteCount}</Text>
                </View>
              )}
            </View>
            {category.description && (
              <Text style={styles.categoryDescription}>
                {category.description}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {isExpanded && hasChildren && (
          <View>
            {category.children.map(child => renderCategoryItem(child, depth + 1))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.greetingRow}>
          <View>
            <Text style={[styles.greeting, { color: getGreeting().color }]}>
              {getGreeting().time}, {username}
            </Text>
            <Text style={styles.activeTime}>
              Aktif süre: {formatActiveTime(activeTime)}
            </Text>
          </View>
          {currentQuote && (
            <View style={styles.quoteContainer}>
              <Text style={styles.quoteText}>"{currentQuote.text}"</Text>
              <Text style={styles.quoteAuthor}>- {currentQuote.author}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={24} color="#95A5A6" />
          <TextInput
            style={styles.searchInput}
            placeholder="Kategori ara..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <MaterialIcons name="close" size={24} color="#95A5A6" />
            </TouchableOpacity>
          ) : null}
        </View>
        {filteredCategories.length > 0 && (
          <TouchableOpacity 
            style={styles.collapseButton} 
            onPress={collapseAll}
          >
            <MaterialIcons 
              name={isAllExpanded ? "unfold-less" : "unfold-more"} 
              size={24} 
              color="#4A90E2" 
            />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {filteredCategories.length > 0 ? (
          filteredCategories.map(category => renderCategoryItem(category))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons 
              name={searchQuery ? 'search-off' : 'folder-open'} 
              size={64} 
              color="#95A5A6" 
            />
            <Text style={styles.emptyText}>
              {searchQuery ? 'Aramanızla eşleşen kategori bulunamadı' : 'Henüz hiç kategori oluşturulmamış'}
            </Text>
            <Text style={styles.emptySubText}>
              {searchQuery ? 'Farklı bir arama yapmayı deneyin' : 'Admin panelinden yeni kategoriler ekleyebilirsiniz'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  activeTime: {
    fontSize: 14,
    color: '#666666',
  },
  quoteContainer: {
    flex: 1,
    marginLeft: 16,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#E1E8ED',
  },
  quoteText: {
    fontSize: 14,
    color: '#2C3E50',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  quoteAuthor: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'right',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#2C3E50',
  },
  collapseButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F6FA',
  },
  content: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryTexts: {
    marginLeft: 12,
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  childrenContainer: {
    backgroundColor: '#FAFBFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#2C3E50',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 8,
    textAlign: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  categoryContent: {
    flex: 1,
    marginLeft: 12,
  },
  nonSelectableText: {
    color: '#95A5A6',
  },
  notSelectableLabel: {
    fontSize: 12,
    color: '#95A5A6',
    fontStyle: 'italic',
    marginTop: 2,
  },
});
