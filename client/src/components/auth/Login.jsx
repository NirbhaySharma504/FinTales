import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      setError('Oops! Could not sign in: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(to right, #a1c4fd, #c2e9fb)',
          borderRadius: 3,
          padding: 3,
        }}
      >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <EmojiEmotionsIcon color="primary" sx={{ fontSize: 50 }} />
          <Typography variant="h3" component="h1" fontWeight="bold" sx={{ mt: 1 }}>
            Welcome to FinTales!
          </Typography>
          <Typography variant="h6" color="text.secondary">
            A fun way to learn about money 🚀
          </Typography>
        </Box>

        <Card sx={{ width: '100%', borderRadius: 4, boxShadow: 6 }}>
          <CardHeader
            title="Log In to Start Learning"
            titleTypographyProps={{ align: 'center', fontSize: '1.5rem', fontWeight: 600 }}
          />
          <CardContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Button
              variant="contained"
              fullWidth
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                backgroundColor: '#4caf50',
                ':hover': { backgroundColor: '#43a047' },
                borderRadius: '12px',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign in with Google'}
            </Button>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body2" color="text.secondary" align="center">
              By signing in, you agree to our <strong>Terms</strong> and <strong>Privacy Policy</strong>
            </Typography>
          </CardContent>
        </Card>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          No account? Just sign in — we’ll create one for you! 🎉
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;
