import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Receipt, Camera, X, PlusCircle, Save } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { THEME_COLORS } from '@/constants/colors';
import { addExpense } from '@/services/expenseService';
import { fetchTrips } from '@/services/expenseService';
import CategorySelector from '@/components/CategorySelector';
import CurrencySelector from '@/components/CurrencySelector';
import DateTimePicker from '@/components/DateTimePicker';
import { TripData } from '@/types';

const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Food', icon: 'utensils' },
  { id: 'transport', name: 'Transport', icon: 'car' },
  { id: 'accommodation', name: 'Accommodation', icon: 'bed' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping-bag' },
  { id: 'entertainment', name: 'Entertainment', icon: 'film' },
  { id: 'activities', name: 'Activities', icon: 'hiking' },
  { id: 'other', name: 'Other', icon: 'ellipsis-h' },
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
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [trips, setTrips] = useState<TripData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const loadTrips = async () => {
      try {
        const tripsData = await fetchTrips();
        // Filter only active and upcoming trips
        const availableTrips = tripsData.filter(trip => 
          new Date(trip.endDate) >= new Date()
        );
        setTrips(availableTrips);
        
        // Auto-select the first trip if available
        if (availableTrips.length > 0) {
          setSelectedTrip(availableTrips[0].id);
        }
      } catch (error) {
        console.error('Error loading trips for expense:', error);
      }
    };
    
    loadTrips();
  }, []);
  
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
  
  const removeImage = () => {
    setReceiptImage(null);
  };
  
  const handleSubmit = async () => {
    // Validate inputs
    if (!title) {
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
    
    if (!selectedTrip) {
      setError('Please select a trip');
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
        date: date.toISOString(),
        notes,
        receiptImage,
        tripId: selectedTrip,
      });
      
      // Reset form and navigate back
      resetForm();
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={100}
    >
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
              placeholder="What did you spend on?"
              placeholderTextColor={colors.textLight}
              value={title}
              onChangeText={setTitle}
            />
          </View>
          
          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="0.00"
                placeholderTextColor={colors.textLight}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
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
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Trip</Text>
            {trips.length === 0 ? (
              <View style={[styles.noTripsContainer, { backgroundColor: colors.cardAlt }]}>
                <Text style={[styles.noTripsText, { color: colors.textLight }]}>
                  No active trips available
                </Text>
                <TouchableOpacity 
                  style={[styles.createTripButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/trips/new')}
                >
                  <PlusCircle size={16} color="#FFFFFF" />
                  <Text style={styles.createTripButtonText}>Create Trip</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tripsContainer}
              >
                {trips.map((trip) => (
                  <TouchableOpacity
                    key={trip.id}
                    style={[
                      styles.tripItem,
                      { backgroundColor: selectedTrip === trip.id ? colors.primaryLight : colors.card },
                      { borderColor: selectedTrip === trip.id ? colors.primary : colors.border }
                    ]}
                    onPress={() => setSelectedTrip(trip.id)}
                  >
                    <Text 
                      style={[
                        styles.tripName, 
                        { color: selectedTrip === trip.id ? colors.primary : colors.text }
                      ]}
                    >
                      {trip.name}
                    </Text>
                    <Text 
                      style={[
                        styles.tripDestination, 
                        { color: selectedTrip === trip.id ? colors.primary : colors.textLight }
                      ]}
                    >
                      {trip.destination}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
          
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
              <View style={styles.receiptImageContainer}>
                <Image source={{ uri: receiptImage }} style={styles.receiptImage} />
                <TouchableOpacity 
                  style={[styles.removeImageButton, { backgroundColor: colors.error }]}
                  onPress={removeImage}
                >
                  <X size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.uploadOptions, { borderColor: colors.border }]}>
                <TouchableOpacity 
                  style={[styles.uploadOption, { backgroundColor: colors.card }]}
                  onPress={pickImage}
                >
                  <Receipt size={24} color={colors.primary} />
                  <Text style={[styles.uploadOptionText, { color: colors.text }]}>
                    Choose File
                  </Text>
                </TouchableOpacity>
                
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                
                <TouchableOpacity 
                  style={[styles.uploadOption, { backgroundColor: colors.card }]}
                  onPress={takePicture}
                >
                  <Camera size={24} color={colors.primary} />
                  <Text style={[styles.uploadOptionText, { color: colors.text }]}>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 120,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  textArea: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
  },
  noTripsContainer: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  noTripsText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 12,
  },
  createTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createTripButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
  },
  tripsContainer: {
    paddingVertical: 8,
  },
  tripItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    minWidth: 150,
  },
  tripName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  tripDestination: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  uploadOptions: {
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
  uploadOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginTop: 8,
  },
  divider: {
    width: 1,
  },
  receiptImageContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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