import { updateProfile } from 'firebase/auth';
import { auth } from '@/config/firebase';

export const updateUserProfile = async (profileData: { displayName?: string, photoURL?: string }) => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('No user is signed in');
  }
  
  try {
    await updateProfile(user, profileData);
    // Force a refresh of the user to get updated data
    return user;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};