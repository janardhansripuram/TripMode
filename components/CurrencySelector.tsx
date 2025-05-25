import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native';
import { THEME_COLORS } from '@/constants/colors';
import { Check, ChevronDown } from 'lucide-react-native';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
];

interface CurrencySelectorProps {
  selectedCurrency: string;
  onSelectCurrency: (currencyCode: string) => void;
  theme: 'light' | 'dark';
}

export default function CurrencySelector({ 
  selectedCurrency, 
  onSelectCurrency,
  theme
}: CurrencySelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const colors = THEME_COLORS[theme];
  
  const selectedCurrencyObj = CURRENCIES.find(curr => curr.code === selectedCurrency);
  
  return (
    <View>
      <TouchableOpacity 
        style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.selectorText, { color: colors.text }]}>
          {selectedCurrencyObj?.code || 'USD'}
        </Text>
        <ChevronDown size={20} color={colors.textLight} />
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Currency</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalClose, { color: colors.primary }]}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={CURRENCIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.currencyItem,
                    { backgroundColor: selectedCurrency === item.code ? colors.primaryLight : colors.card }
                  ]}
                  onPress={() => {
                    onSelectCurrency(item.code);
                    setModalVisible(false);
                  }}
                >
                  <View style={styles.currencyInfo}>
                    <Text style={[styles.currencyCode, { color: colors.text }]}>{item.code}</Text>
                    <Text style={[styles.currencyName, { color: colors.textLight }]}>
                      {item.symbol} - {item.name}
                    </Text>
                  </View>
                  
                  {selectedCurrency === item.code && (
                    <Check size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.currencyList}
            />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  currencyList: {
    paddingHorizontal: 24,
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  currencyInfo: {},
  currencyCode: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  currencyName: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
});