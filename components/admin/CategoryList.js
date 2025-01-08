import React from 'react';
import { View } from 'react-native';
import CategoryItem from './CategoryItem';

const CategoryList = ({
  categories,
  expandedCategories,
  onToggleExpand,
  onAddSubcategory,
  onEditCategory,
  onDeleteCategory,
  onAddNote,
  onEditNote,
}) => {
  const renderCategory = (category, depth = 0) => {
    const isExpanded = expandedCategories.has(category.id);

    return (
      <View key={category.id}>
        <CategoryItem
          category={category}
          depth={depth}
          isExpanded={isExpanded}
          onToggle={() => onToggleExpand(category.id)}
          onSelect={() => {}}
          onEdit={() => onEditCategory(category)}
          onDelete={() => onDeleteCategory(category)}
          onAddSubcategory={() => onAddSubcategory(category)}
          onAddNote={() => onAddNote(category)}
          onEditNote={onEditNote}
        >
          {isExpanded && category.children?.length > 0 && (
            <View>
              {category.children.map(child => renderCategory(child, depth + 1))}
            </View>
          )}
        </CategoryItem>
      </View>
    );
  };

  return (
    <View>
      {categories.map(category => renderCategory(category))}
    </View>
  );
};

export default CategoryList; 