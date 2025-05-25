import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Moon, Sun, User, Bell, Globe, Shield, LogOut, ChevronRight, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/context/ThemeContext';
import { THEME_COLORS } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { updateUserProfile } from '@/services/userService';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const colors = THEME_COLORS[theme];
  const { user, signOut } = useAuth();
  const router = useRouter();
  
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };
  
  const handleUpdateProfilePicture = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setIsUpdatingProfile(true);
        const imageUri = result.assets[0].uri;
        await updateUserProfile({ photoURL: imageUri });
        setIsUpdatingProfile(false);
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
      setIsUpdatingProfile(false);
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.profileSection, { backgroundColor: colors.card }]}>
          <TouchableOpacity 
            style={styles.profilePictureContainer}
            onPress={handleUpdateProfilePicture}
            disabled={isUpdatingProfile}
          >
            {isUpdatingProfile ? (
              <View style={[styles.profilePicture, { backgroundColor: colors.cardAlt }]}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.profilePicture} />
            ) : (
              <View style={[styles.profilePicture, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.profileInitial, { color: colors.primary }]}>
                  {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
                </Text>
              </View>
            )}
            <View style={[styles.cameraIcon, { backgroundColor: colors.primary }]}>
              <Camera size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {user?.displayName || 'User'}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.textLight }]}>
              {user?.email || 'No email'}
            </Text>
          </View>
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textLight }]}>Preferences</Text>
          
          <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
            <View style={styles.settingIconContainer}>
              {theme === 'dark' ? (
                <Moon size={22} color={colors.primary} />
              ) : (
                <Sun size={22} color={colors.primary} />
              )}
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={theme === 'dark' ? colors.primary : colors.background}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: colors.card }]}
            onPress={() => router.push('/profile')}
          >
            <View style={styles.settingIconContainer}>
              <User size={22} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Edit Profile</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: colors.card }]}
            onPress={() => router.push('/notifications')}
          >
            <View style={styles.settingIconContainer}>
              <Bell size={22} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Notifications</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: colors.card }]}
            onPress={() => router.push('/currency')}
          >
            <View style={styles.settingIconContainer}>
              <Globe size={22} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Default Currency</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textLight }]}>Security</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: colors.card }]}
            onPress={() => router.push('/change-password')}
          >
            <View style={styles.settingIconContainer}>
              <Shield size={22} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Change Password</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textLight }]}>About</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: colors.card }]}
            onPress={() => router.push('/about')}
          >
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>About TripMode</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: colors.card }]}
            onPress={() => router.push('/privacy-policy')}
          >
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Privacy Policy</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: colors.card }]}
            onPress={() => router.push('/terms')}
          >
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Terms of Service</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.signOutButton, { backgroundColor: colors.errorLight }]}
          onPress={handleSignOut}
        >
          <LogOut size={20} color={colors.error} />
          <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
        </TouchableOpacity>
        
        <Text style={[styles.versionText, { color: colors.textLight }]}>
          Version 1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  profilePictureContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 30,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  signOutText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginLeft: 8,
  },
  versionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
});