import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Receipt, Camera, DollarSign, Calendar, Users, Save } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { THEME_COLORS } from '@/constants/colors';
import { addExpense,fetchRecentExpenses,fetchTotalSpent } from '@/services/expenseService';
import { fetchTrips } from '@/services/expenseService';
import CategorySelector from '@/components/CategorySelector';
import CurrencySelector from '@/components/CurrencySelector';
import DateTimePicker from '@/components/DateTimePicker';
import { TripData } from '@/types';
import { Timestamp } from 'firebase/firestore';

const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Food & Drinks', icon: 'utensils' },
  { id: 'transport', name: 'Transportation', icon: 'car' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping-bag' },
  { id: 'entertainment', name: 'Entertainment', icon: 'film' },
  { id: 'utilities', name: 'Utilities', icon: 'zap' },
  { id: 'rent', name: 'Rent', icon: 'home' },
  { id: 'other', name: 'Other', icon: 'more-horizontal' },
];

export default function AddExpenseScreen() {
  const { theme } = useTheme();
  const colors = THEME_COLORS[theme];
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setReceiptImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };
  
  const takePicture = async () => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      
      if (cameraPermission.status !== 'granted') {
        alert('We need camera permissions to take pictures!');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setReceiptImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  };
  
  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (!category) {
      setError('Please select a category');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await addExpense({
        title,
        amount: parseFloat(amount),
        category,
        currency,
        date: Timestamp.fromDate(date),
        notes,
        receiptImage,
        tripId: selectedTrip,
      });
    
      // Reset form and navigate back
      resetForm();
       fetchRecentExpenses(),
            
      fetchTotalSpent()
      router.push('/(tabs)');
    } catch (error: any) {
      setError(error.message || 'Failed to add expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setTitle('');
    setAmount('');
    setCategory('');
    setCurrency('USD');
    setDate(new Date());
    setNotes('');
    setReceiptImage(null);
    setError('');
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Add Expense</Text>
        </View>
        
        {error ? (
          <View style={[styles.errorContainer, { backgroundColor: colors.errorLight }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        ) : null}
        
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="What's this expense for?"
              placeholderTextColor={colors.textLight}
              value={title}
              onChangeText={setTitle}
            />
          </View>
          
          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
              <View style={[styles.amountContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <DollarSign size={20} color={colors.primary} />
                <TextInput
                  style={[styles.amountInput, { color: colors.text }]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textLight}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={[styles.inputGroup, { width: 120 }]}>
              <Text style={[styles.label, { color: colors.text }]}>Currency</Text>
              <CurrencySelector
                selectedCurrency={currency}
                onSelectCurrency={setCurrency}
                theme={theme}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Category</Text>
            <CategorySelector
              categories={EXPENSE_CATEGORIES}
              selectedCategory={category}
              onSelectCategory={setCategory}
              theme={theme}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Date</Text>
            <DateTimePicker
              value={date}
              onChange={setDate}
              theme={theme}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.splitButton, { backgroundColor: colors.primaryLight }]}
            onPress={() => router.push('/split-expense')}
          >
            <Users size={20} color={colors.primary} />
            <Text style={[styles.splitButtonText, { color: colors.primary }]}>
              Split with friends
            </Text>
          </TouchableOpacity>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Notes (Optional)</Text>
            <TextInput
              style={[
                styles.input, 
                styles.textArea, 
                { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }
              ]}
              placeholder="Add any additional details"
              placeholderTextColor={colors.textLight}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Receipt (Optional)</Text>
            
            {receiptImage ? (
              <View style={styles.receiptPreview}>
                <Image source={{ uri: receiptImage }} style={styles.receiptImage} />
                <TouchableOpacity 
                  style={[styles.removeButton, { backgroundColor: colors.error }]}
                  onPress={() => setReceiptImage(null)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.uploadContainer, { borderColor: colors.border }]}>
                <TouchableOpacity 
                  style={[styles.uploadOption, { backgroundColor: colors.card }]}
                  onPress={pickImage}
                >
                  <Receipt size={24} color={colors.primary} />
                  <Text style={[styles.uploadText, { color: colors.text }]}>
                    Choose File
                  </Text>
                </TouchableOpacity>
                
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                
                <TouchableOpacity 
                  style={[styles.uploadOption, { backgroundColor: colors.card }]}
                  onPress={takePicture}
                >
                  <Camera size={24} color={colors.primary} />
                  <Text style={[styles.uploadText, { color: colors.text }]}>
                    Take Photo
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Save size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Save Expense</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
  },
  errorContainer: {
    marginHorizontal: 24,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  form: {
    paddingHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountContainer: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  amountInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
  },
  splitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  splitButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginLeft: 8,
  },
  uploadContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    height: 100,
  },
  uploadOption: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginTop: 8,
  },
  divider: {
    width: 1,
  },
  receiptPreview: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  submitButton: {
    height: 56,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  submitButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
});