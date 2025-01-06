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
import { collection, query, orderBy, onSnapshot, getDocs } from '@firebase/firestore';
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

  useEffect(() => {
    loadCategories();
    loadUsername();

    // Firestore dinleyicisi
    const q = query(
      collection(db, 'categories'),
      orderBy('createdAt', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, {
      next: async (snapshot) => {
        try {
          logger.log('Kategori değişikliği algılandı');
          const allCategories = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate()
          }));
          
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
          logger.log('Yeni kategori ağacı güncellendi:', { categoryCount: allCategories.length });
          setCategories(tree);
          // Arama durumunda filtrelemeyi uygula
          if (searchQuery) {
            const filtered = categoryService.getFilteredCategories(tree, searchQuery);
            setFilteredCategories(filtered);
          } else {
            setFilteredCategories(tree);
          }
        } catch (error) {
          logger.error('Kategori işleme hatası:', error);
          Alert.alert(
            'Hata',
            'Kategoriler işlenirken bir hata oluştu: ' + error.message
          );
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        logger.error('Firestore dinleyici hatası:', error);
        setLoading(false);
        Alert.alert(
          'Hata',
          'Kategoriler güncellenirken bir hata oluştu: ' + error.message
        );
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

    return () => {
      unsubscribe();
      authUnsubscribe();
    };
  }, []); // searchQuery'yi dependency'den kaldırdık

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'günler';
    } else if (hour >= 12 && hour < 18) {
      return 'günler';
    } else {
      return 'akşamlar';
    }
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
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children && category.children.length > 0;

    return (
      <View key={category.id}>
        <TouchableOpacity
          style={[styles.categoryItem, { paddingLeft }]}
          onPress={() => handleCategoryPress(category)}
        >
          <View style={styles.categoryInfo}>
            <MaterialIcons 
              name={category.icon || 'folder'} 
              size={24} 
              color="#2C3E50" 
            />
            <View style={styles.categoryTexts}>
              <Text style={styles.categoryName}>{category.name}</Text>
              {category.description ? (
                <Text style={styles.categoryDescription}>
                  {category.description}
                </Text>
              ) : null}
            </View>
          </View>
          {hasChildren ? (
            <MaterialIcons 
              name={isExpanded ? 'expand-less' : 'expand-more'} 
              size={24} 
              color="#95A5A6" 
            />
          ) : (
            <MaterialIcons 
              name={category.hasNotes ? 'note' : 'chevron-right'} 
              size={24} 
              color="#95A5A6" 
            />
          )}
        </TouchableOpacity>
        
        {isExpanded && hasChildren && (
          <View style={styles.childrenContainer}>
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
        <Text style={styles.greeting}>
          İyi {getGreeting()}, {username}
        </Text>
        <Text style={styles.welcomeText}>Notlarınızı kategorize edin ve düzenleyin</Text>
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
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  content: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
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
});
