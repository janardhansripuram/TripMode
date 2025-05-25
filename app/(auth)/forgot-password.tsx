import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { THEME_COLORS } from '@/constants/colors';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { resetPassword } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const colors = THEME_COLORS[theme];

  const handleResetPassword = async () => {
    if (!email) {
      setErrorMessage('Please enter your email.');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      await resetPassword(email);
      setSuccessMessage('Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Reset Password</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.description, { color: colors.textLight }]}>
          Enter your email address and we'll send you instructions to reset your password.
        </Text>
        
        {errorMessage ? (
          <View style={[styles.messageContainer, { backgroundColor: colors.errorLight }]}>
            <Text style={[styles.messageText, { color: colors.error }]}>{errorMessage}</Text>
          </View>
        ) : null}
        
        {successMessage ? (
          <View style={[styles.messageContainer, { backgroundColor: colors.successLight }]}>
            <Text style={[styles.messageText, { color: colors.success }]}>{successMessage}</Text>
          </View>
        ) : null}
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Enter your email"
            placeholderTextColor={colors.textLight}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: colors.primary }]}
          onPress={handleResetPassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Send size={20} color="#FFFFFF" />
              <Text style={styles.resetText}>Send Reset Link</Text>
            </>
          )}
        </TouchableOpacity>
        
        <Link href="/login" asChild>
          <TouchableOpacity style={styles.returnToLogin}>
            <Text style={[styles.returnToLoginText, { color: colors.primary }]}>Return to Sign In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  messageText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 24,
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
  resetButton: {
    height: 56,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  resetText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  returnToLogin: {
    alignItems: 'center',
  },
  returnToLoginText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
});