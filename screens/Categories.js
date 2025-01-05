import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, onSnapshot } from '@firebase/firestore';
import { db, auth } from '../firebaseConfig/config';
import { getCurrentUserRole } from '../services/authService';
import { LinearGradient } from 'expo-linear-gradient';

const motivationalQuotes = [
  "Öğrenme arzusu, başarının ilk adımıdır.",
  "Her gün yeni bir şey öğren!",
  "Bilgi paylaştıkça çoğalır.",
  "Başarı, her gün küçük adımlar atmakla başlar.",
  "Öğrenmenin yaşı yoktur."
];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [navigatingId, setNavigatingId] = useState(null);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [userStats, setUserStats] = useState({
    totalNotes: 0,
    totalTime: '0 saat',
    lastVisit: new Date().toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    })
  });
  const navigation = useNavigation();

  useEffect(() => {
    // Kullanıcı bilgilerini yükle
    const loadUserInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        const role = await getCurrentUserRole();
        setUserRole(role);
        // Önce displayName'i kontrol et, yoksa email'den kullanıcı adını al
        const displayName = user.displayName || user.email.split('@')[0];
        setUserName(displayName);
      }
    };
    loadUserInfo();

    // Kategorileri yükle
    const unsubscribeCategories = onSnapshot(
      collection(db, "Kategoriler"),
      (snapshot) => {
        const categoriesData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          categoriesData.push({
            id: doc.id,
            name: data.ad || doc.id,
            description: data.aciklama || '',
            icon: data.icon || 'folder',
          });
        });
        setCategories(categoriesData);
        setLoading(false);
      },
      (error) => {
        console.error('Kategoriler dinlenirken hata:', error);
        setLoading(false);
      }
    );

    // Kullanıcı istatistiklerini yükle
    const loadUserStats = async () => {
      try {
        setUserStats({
          totalNotes: 0,            // Kullanıcının toplam not sayısı
          totalTime: '0 saat',      // Toplam çalışma süresi
          lastVisit: new Date().toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
          })
        });
      } catch (error) {
        console.error('Kullanıcı istatistikleri yüklenirken hata:', error);
      }
    };

    loadUserStats();

    return () => {
      unsubscribeCategories();
    };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  const getRandomQuote = () => {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  };

  const handleCategoryPress = async (category) => {
    try {
      setNavigatingId(category.id);
      navigation.navigate('Subcategories', {
        categoryId: category.id,
        categoryName: category.name
      });
    } catch (error) {
      console.error('Kategori detaylarına gidilemedi:', error);
    } finally {
      setNavigatingId(null);
    }
  };

  const renderFeaturedNote = ({ item }) => (
    <TouchableOpacity style={styles.featuredNoteCard}>
      <MaterialIcons name="star" size={20} color="#FFD700" />
      <Text style={styles.featuredNoteTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.featuredNoteSubtitle}>{item.category}</Text>
      <View style={styles.featuredNoteViews}>
        <MaterialIcons name="visibility" size={16} color="#95A5A6" />
        <Text style={styles.viewsText}>{item.views}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryCard} 
      onPress={() => handleCategoryPress(item)}
      disabled={navigatingId === item.id}
    >
      <View style={styles.cardContent}>
        <MaterialIcons name={item.icon} size={24} color="#2C3E50" />
        <View style={styles.textContainer}>
          <Text style={styles.categoryText}>{item.name}</Text>
          {item.description ? (
            <Text style={styles.descriptionText}>{item.description}</Text>
          ) : null}
        </View>
      </View>
      {navigatingId === item.id ? (
        <ActivityIndicator size={24} color="#4A90E2" />
      ) : (
        <MaterialIcons name="chevron-right" size={24} color="#2C3E50" />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={40} color="#4A90E2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#4A90E2', '#50C878']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeCard}
        >
          <Text style={styles.greeting}>{getGreeting()} {userName}</Text>
          <Text style={styles.quote}>{getRandomQuote()}</Text>
        </LinearGradient>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="note" size={24} color="#4A90E2" />
            <Text style={styles.statNumber}>{userStats.totalNotes}</Text>
            <Text style={styles.statLabel}>Not</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="access-time" size={24} color="#50C878" />
            <Text style={styles.statNumber}>{userStats.totalTime}</Text>
            <Text style={styles.statLabel}>Süre</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="calendar-today" size={24} color="#E74C3C" />
            <Text style={styles.statNumber}>{userStats.lastVisit}</Text>
            <Text style={styles.statLabel}>Son Giriş</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Kategoriler</Text>
        <View style={styles.categoriesList}>
          {categories.map((item) => (
            <TouchableOpacity 
              key={item.id}
              style={styles.categoryCard} 
              onPress={() => handleCategoryPress(item)}
              disabled={navigatingId === item.id}
            >
              <View style={styles.cardContent}>
                <MaterialIcons name={item.icon} size={24} color="#2C3E50" />
                <View style={styles.textContainer}>
                  <Text style={styles.categoryText}>{item.name}</Text>
                  {item.description ? (
                    <Text style={styles.descriptionText}>{item.description}</Text>
                  ) : null}
                </View>
              </View>
              {navigatingId === item.id ? (
                <ActivityIndicator size={24} color="#4A90E2" />
              ) : (
                <MaterialIcons name="chevron-right" size={24} color="#2C3E50" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  content: {
    flex: 1,
  },
  welcomeCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  quote: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 100,
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 8,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
    textAlign: 'center',
  },
  featuredSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 16,
    marginBottom: 12,
  },
  featuredList: {
    paddingHorizontal: 16,
  },
  featuredNoteCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featuredNoteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 8,
  },
  featuredNoteSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  featuredNoteViews: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  viewsText: {
    fontSize: 12,
    color: '#95A5A6',
    marginLeft: 4,
  },
  categoriesList: {
    padding: 16,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  descriptionText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
