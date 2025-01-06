import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function CategoryList({ 
  categories, 
  expandedCategories, 
  onToggleCategory,
  onEditCategory,
  onDeleteCategory,
  onSelectCategory,
  onAddSubcategory
}) {
  const renderCategoryItem = (category, depth = 0) => {
    const paddingLeft = 16 + (depth * 20);
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <View key={category.id}>
        <View style={[styles.categoryItem, { paddingLeft }]}>
          <TouchableOpacity 
            style={styles.categoryInfo}
            onPress={() => onSelectCategory(category)}
          >
            {hasChildren && (
              <TouchableOpacity 
                onPress={() => onToggleCategory(category.id)}
                style={styles.expandButton}
              >
                <MaterialIcons 
                  name={isExpanded ? 'expand-more' : 'chevron-right'} 
                  size={24} 
                  color="#2C3E50" 
                />
              </TouchableOpacity>
            )}
            <MaterialIcons 
              name={category.icon || 'folder'} 
              size={24} 
              color="#2C3E50" 
            />
            <View style={styles.categoryTexts}>
              <Text style={styles.categoryName}>{category.name}</Text>
              {category.description ? (
                <Text style={styles.categoryDescription}>{category.description}</Text>
              ) : null}
            </View>
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onAddSubcategory(category)}
            >
              <MaterialIcons name="add" size={20} color="#27AE60" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => onEditCategory(category)}
              style={styles.actionButton}
            >
              <MaterialIcons name="edit" size={20} color="#4A90E2" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => onDeleteCategory(category)}
              style={styles.actionButton}
            >
              <MaterialIcons name="delete" size={20} color="#E74C3C" />
            </TouchableOpacity>
          </View>
        </View>

        {isExpanded && hasChildren && (
          <View>
            {category.children.map(child => renderCategoryItem(child, depth + 1))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {categories.map(category => renderCategoryItem(category))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  categoryInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButton: {
    padding: 4,
    marginRight: 8,
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
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
}); 