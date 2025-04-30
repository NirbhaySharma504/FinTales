import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Chip,
  Stack,
  Paper,
  CircularProgress,
  Alert,
  Autocomplete,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';

// Suggested interests by category
const SUGGESTED_INTERESTS = {
  'Music Artists': [
    'The Weeknd', 'Drake', 'Taylor Swift', 'Bad Bunny', 'Ed Sheeran', 
    'Beyoncé', 'BTS', 'Kendrick Lamar', 'Ariana Grande', 'Post Malone'
  ],
  'Movies/Series': [
    'Stranger Things', 'Breaking Bad', 'Game of Thrones', 'The Office', 
    'Friends', 'Marvel Movies', 'Star Wars', 'Black Mirror', 'Money Heist'
  ],
  'Comics & Anime': [
    'Spider-Man', 'Batman', 'Attack on Titan', 'Naruto', 'One Piece', 
    'Death Note', 'My Hero Academia', 'Dragon Ball', 'Demon Slayer'
  ],
  'Art Style': [
    'Street Art', 'Photography', 'Digital Art', 'Pixel Art', 
    'Anime Style', '3D Modeling', 'Watercolor', 'Vector Art'
  ],
  'Spending Habits': [
    'Online Shopping', 'Crypto Investment', 'Stock Trading', 'Real Estate', 
    'Monthly Budgeting', 'Emergency Savings', 'Retirement Planning'
  ],
  'Hobbies/Activities': [
    'Video Gaming', 'Gym Workouts', 'Hiking', 'Photography', 
    'Playing Guitar', 'Gardening', 'Yoga', 'Basketball', 'Cooking'
  ]
};

const CATEGORIES = Object.keys(SUGGESTED_INTERESTS);

const PreferencesForm = ({ 
  userPreferences = {}, 
  onSavePreferences, 
  loading = false, 
  error = null,
  isUpdateMode = false
}) => {
  // Initialize with structured preferences or empty structure
  const [categorizedInterests, setCategorizedInterests] = useState(() => {
    const initialState = {};
    CATEGORIES.forEach(category => {
      initialState[category] = userPreferences[category] || [];
    });
    return initialState;
  });
  
  // Map to store new interest input for each category
  const [newInterests, setNewInterests] = useState(() => {
    const initialState = {};
    CATEGORIES.forEach(category => {
      initialState[category] = '';
    });
    return initialState;
  });

  const handleAdd = (category, interest) => {
    if (interest && !categorizedInterests[category].includes(interest)) {
      setCategorizedInterests(prev => ({
        ...prev,
        [category]: [...prev[category], interest]
      }));
      setNewInterests(prev => ({
        ...prev,
        [category]: ''
      }));
    }
  };

  const handleDelete = (category, interestToDelete) => {
    setCategorizedInterests(prev => ({
      ...prev,
      [category]: prev[category].filter(interest => interest !== interestToDelete)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Only include categories with at least one interest
    const interestsToSave = {};
    Object.entries(categorizedInterests).forEach(([category, interests]) => {
      if (interests.length > 0) {
        interestsToSave[category] = interests;
      }
    });
    
    if (Object.keys(interestsToSave).length > 0) {
      onSavePreferences(interestsToSave);
    }
  };

  // Count total interests across all categories
  const totalInterestCount = Object.values(categorizedInterests)
    .reduce((total, categoryInterests) => total + categoryInterests.length, 0);

  return (
    <Paper 
      elevation={isUpdateMode ? 1 : 3} 
      sx={{ 
        p: 3, 
        mt: isUpdateMode ? 2 : 0,
        width: '100%',
        maxWidth: '100%'
      }}
    >
      <form onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>
          {isUpdateMode ? 'Update Your Interests' : 'Set Your Interests'}
        </Typography>
        
        {!isUpdateMode && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please select your interests in different categories. This helps us personalize your financial education experience.
          </Typography>
        )}
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {CATEGORIES.map((category, index) => (
          <Box key={category} sx={{ mb: 3 }}>
            {index > 0 && <Divider sx={{ mb: 2 }} />}
            
            <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ color: '#3b82f6' }}>
              {category} ({categorizedInterests[category].length})
            </Typography>
            
            <Autocomplete
              freeSolo
              size="small"
              options={SUGGESTED_INTERESTS[category].filter(
                option => !categorizedInterests[category].includes(option)
              )}
              value={newInterests[category]}
              onChange={(event, newValue) => {
                if (newValue) {
                  handleAdd(category, newValue);
                }
              }}
              inputValue={newInterests[category]}
              onInputChange={(event, newInputValue) => {
                setNewInterests(prev => ({
                  ...prev,
                  [category]: newInputValue
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={`Add ${category} interest`}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {params.InputProps.endAdornment}
                        <Button
                          size="small"
                          onClick={() => handleAdd(category, newInterests[category])}
                          disabled={!newInterests[category] || categorizedInterests[category].includes(newInterests[category])}
                        >
                          <AddIcon />
                        </Button>
                      </>
                    ),
                  }}
                />
              )}
            />
            
            <Stack 
              direction="row" 
              spacing={1} 
              sx={{ 
                flexWrap: 'wrap', 
                gap: 1,
                width: '100%',
                minHeight: '50px', 
                p: 1
              }}
            >
              {categorizedInterests[category].length > 0 ? (
                categorizedInterests[category].map((interest) => (
                  <Chip
                    key={interest}
                    label={interest}
                    onDelete={() => handleDelete(category, interest)}
                    color="primary"
                    variant="outlined"
                    sx={{ marginBottom: '4px' }}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No {category} interests added yet
                </Typography>
              )}
            </Stack>
          </Box>
        ))}
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={totalInterestCount < 1 || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{ 
              background: 'linear-gradient(to right, #3b82f6, #06b6d4)',
              px: 3, 
              py: 1 
            }}
          >
            {loading ? 'Saving...' : isUpdateMode ? 'Update' : 'Save & Continue'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default PreferencesForm;