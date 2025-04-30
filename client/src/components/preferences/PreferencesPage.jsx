import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper, Alert, Button } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import PreferencesForm from '../auth/PreferencesForm';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PreferencesPage = () => {
  const { updateUserPreferences, userProfile, isNewUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSavePreferences = async (interests) => {
    setLoading(true);
    setError('');
    
    // Capture isNewUser state before it changes during the update
    const wasNewUser = isNewUser;
    
    try {
      await updateUserPreferences(interests);
      setSuccess(true);
      
      // For new users, redirect to home after saving
      if (wasNewUser) {
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (err) {
      setError('Failed to save preferences: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          py: 4
        }}
      >
        {!isNewUser && (
          <Box sx={{ alignSelf: 'flex-start', mb: 2 }}>
            <Button 
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToHome}
              sx={{ 
                color: '#3b82f6',
                '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.04)' }
              }}
            >
              Back to Home
            </Button>
          </Box>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3, width: '100%' }}>
            {isNewUser 
              ? 'Preferences saved successfully! Redirecting to home page...' 
              : 'Your preferences have been updated successfully!'}
          </Alert>
        )}
        
        <Paper sx={{ p: 4, width: '100%' }} elevation={3}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            {isNewUser ? 'Set Your Interests' : 'Update Your Interests'}
          </Typography>
          
          <PreferencesForm 
            userPreferences={userProfile?.preferences?.interests || {}}
            onSavePreferences={handleSavePreferences}
            loading={loading}
            error={error}
            isUpdateMode={!isNewUser}
          />
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" align="center">
              {isNewUser 
                ? 'You can always update your preferences later from your profile.' 
                : 'Your personalized content will reflect these changes.'}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default PreferencesPage;