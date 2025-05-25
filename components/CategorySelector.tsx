import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { THEME_COLORS } from '@/constants/colors';
import { Check } from 'lucide-react-native';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  theme: 'light' | 'dark';
}

export default function CategorySelector({ 
  categories, 
  selectedCategory, 
  onSelectCategory,
  theme
}: CategorySelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const colors = THEME_COLORS[theme];
  
  const selectedCategoryObj = categories.find(cat => cat.id === selectedCategory);
  
  return (
    <View>
      <TouchableOpacity 
        style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => setModalVisible(true)}
      >
        <Text 
          style={[
            styles.selectorText, 
            { color: selectedCategory ? colors.text : colors.textLight }
          ]}
        >
          {selectedCategoryObj ? selectedCategoryObj.name : 'Select category'}
        </Text>
      </TouchableOpacity>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Category</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalClose, { color: colors.primary }]}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView contentContainerStyle={styles.categoriesContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    { backgroundColor: selectedCategory === category.id ? colors.primaryLight : colors.card }
                  ]}
                  onPress={() => {
                    onSelectCategory(category.id);
                    setModalVisible(false);
                  }}
                >
                  <View style={styles.categoryInfo}>
                    <Text 
                      style={[
                        styles.categoryName, 
                        { color: selectedCategory === category.id ? colors.primary : colors.text }
                      ]}
                    >
                      {category.name}
                    </Text>
                  </View>
                  
                  {selectedCategory === category.id && (
                    <Check size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  selectorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },
  modalClose: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 24,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
});