import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  getIdToken,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);

  // Sign in with Google
  const signInWithGoogle = async () => {
    setError(null);
    try {
      // Set persistence to LOCAL - this keeps the user signed in even when browser is closed
      await setPersistence(auth, browserLocalPersistence);
      
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await getIdToken(result.user);
      
      // Store token in localStorage
      localStorage.setItem('firebaseToken', idToken);
      localStorage.setItem('lastLoginTime', Date.now()); // Track login time
      
      // Send token to backend for verification and user creation/retrieval
      const response = await authService.loginWithFirebase(idToken);
      setUserProfile(response.data.user);
      
      // Check if user is new or has no preferences set
      if (!response.data.user.preferences || 
          !response.data.user.preferences.interests ||
          response.data.user.preferences.interests.length === 0) {
        setIsNewUser(true);
      } else {
        setIsNewUser(false);
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Update user preferences
  const updateUserPreferences = async (interests) => {
    try {
      const response = await authService.updatePreferences(interests);
      
      if (response && response.success) {
        // Update the local userProfile state with new preferences
        setUserProfile(prev => ({
          ...prev,
          preferences: { ...prev?.preferences, interests }
        }));
        
        // User is no longer new after setting preferences
        setIsNewUser(false);
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Log out
  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('firebaseToken');
      localStorage.removeItem('lastLoginTime');
      setCurrentUser(null);
      setUserProfile(null);
      setIsNewUser(false);
    } catch (error) {
      setError(error.message);
    }
  };

  // Refresh token periodically
  const refreshToken = async (user) => {
    if (!user) return null;
    try {
      // Force token refresh if it's older than 55 minutes
      const tokenAge = Date.now() - (localStorage.getItem('lastLoginTime') || 0);
      const forceRefresh = tokenAge > 55 * 60 * 1000; // 55 minutes
      
      // Get fresh ID token
      const idToken = await getIdToken(user, forceRefresh);
      
      // Update stored token
      localStorage.setItem('firebaseToken', idToken);
      if (forceRefresh) {
        localStorage.setItem('lastLoginTime', Date.now());
      }
      
      return idToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  };

  // Fetch user profile from backend
  const fetchUserProfile = async (user) => {
    if (!user) return null;
    
    try {
      // Refresh the token before making API call
      const idToken = await refreshToken(user);
      
      if (!idToken) {
        throw new Error('Failed to refresh authentication token');
      }
      
      const response = await authService.getCurrentUser();
      if (response && response.success) {
        setUserProfile(response.data.user);
        
        // Check if user has preferences set
        const hasPreferences = response.data.user.preferences?.interests 
          && Object.values(response.data.user.preferences.interests)
          .some(array => array.length > 0);
          
        setIsNewUser(!hasPreferences);
      }
      return response;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setCurrentUser(user);
      
      if (user) {
        // User is signed in - refresh token and fetch profile
        await refreshToken(user);
        await fetchUserProfile(user);
      } else {
        // User is signed out
        localStorage.removeItem('firebaseToken');
        localStorage.removeItem('lastLoginTime');
        setUserProfile(null);
        setIsNewUser(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    if (!currentUser) return;
    
    // Refresh token every 50 minutes to ensure it doesn't expire
    const refreshInterval = setInterval(() => {
      refreshToken(currentUser);
    }, 50 * 60 * 1000); // 50 minutes
    
    return () => clearInterval(refreshInterval);
  }, [currentUser]);

  const value = {
    currentUser,
    userProfile,
    isNewUser,
    signInWithGoogle,
    updateUserPreferences,
    logout,
    loading,
    error,
    fetchUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};