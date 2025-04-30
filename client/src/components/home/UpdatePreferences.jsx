import { useState } from 'react';
import { Paper, Typography, Box, Collapse, IconButton, Alert, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useAuth } from '../../contexts/AuthContext';
import PreferencesForm from '../auth/PreferencesForm';

const UpdatePreferences = () => {
  const { userProfile, updateUserPreferences } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleToggle = () => {
    setExpanded(!expanded);
    if (success) setSuccess(false);
  };

  const handleUpdatePreferences = async (newInterests) => {
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      await updateUserPreferences(newInterests);
      setSuccess(true);
      setTimeout(() => {
        setExpanded(false);
      }, 2000);
    } catch (err) {
      setError('Failed to update preferences: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to display interests summary
  const getInterestsSummary = () => {
    if (!userProfile?.preferences?.interests) return 'No interests set yet';
    
    const categories = Object.keys(userProfile.preferences.interests);
    if (categories.length === 0) return 'No interests set yet';
    
    // Get total count of interests
    const totalCount = Object.values(userProfile.preferences.interests)
      .reduce((sum, arr) => sum + (arr?.length || 0), 0);
    
    if (totalCount === 0) return 'No interests set yet';
    
    // Get up to 3 interests from any category
    let sampleInterests = [];
    for (const category of categories) {
      if (userProfile.preferences.interests[category]?.length > 0) {
        sampleInterests = sampleInterests.concat(
          userProfile.preferences.interests[category].slice(0, 3 - sampleInterests.length)
        );
      }
      if (sampleInterests.length >= 3) break;
    }
    
    return `${sampleInterests.join(', ')}${totalCount > sampleInterests.length ? '...' : ''} (${totalCount} total)`;
  };

  return (
    <Paper sx={{ 
      mb: 4,
      width: '100%',
      maxWidth: '100%' // Remove any max-width constraints
    }}>
      <Box 
        onClick={handleToggle} 
        sx={{ 
          p: 2.5, // Increased padding
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          background: 'linear-gradient(to right, #3b82f6, #06b6d4)', // Blue gradient
          color: 'white'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Your Interests</Typography>
        <IconButton size="small" sx={{ color: 'white' }}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      
      {!expanded && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            You're interested in: {getInterestsSummary()}
          </Typography>
        </Box>
      )}
      
      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Your preferences have been updated successfully!
            </Alert>
          )}
          
          <PreferencesForm 
            userPreferences={userProfile?.preferences?.interests || {}}
            onSavePreferences={handleUpdatePreferences}
            loading={loading}
            error={error}
            isUpdateMode={true}
          />
        </Box>
      </Collapse>
    </Paper>
  );
};

export default UpdatePreferences;