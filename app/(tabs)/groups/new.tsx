import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Users, DollarSign, Save } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { THEME_COLORS } from '@/constants/colors';
import CurrencySelector from '@/components/CurrencySelector';
import { createGroup } from '@/services/groupService';

export default function NewGroupScreen() {
  const { theme } = useTheme();
  const colors = THEME_COLORS[theme];
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter a group name');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await createGroup(name, currency);
      router.back();
    } catch (error: any) {
      setError(error.message || 'Failed to create group. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>New Group</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        {error ? (
          <View style={[styles.errorContainer, { backgroundColor: colors.errorLight }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        ) : null}
        
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Group Name</Text>
            <View style={[styles.inputWithIcon, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Users size={20} color={colors.primary} />
              <TextInput
                style={[styles.iconInput, { color: colors.text }]}
                placeholder="Enter group name"
                placeholderTextColor={colors.textLight}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Currency</Text>
            <CurrencySelector
              selectedCurrency={currency}
              onSelectCurrency={setCurrency}
              theme={theme}
            />
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
                <Text style={styles.submitButtonText}>Create Group</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  inputWithIcon: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
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