import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

const Register = () => {
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
      setError('Failed to sign up with Google: ' + err.message);
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
        }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          {/* Removed the image and just using text */}
          <Typography variant="h4" component="h1" gutterBottom>
            Join FinTales
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Start your financial education journey today
          </Typography>
        </Box>

        <Card sx={{ width: '100%', mb: 4 }}>
          <CardHeader
            title="Sign Up"
            subheader="Create your FinTales account"
            titleTypographyProps={{ align: 'center' }}
            subheaderTypographyProps={{ align: 'center' }}
          />
          <CardContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign Up with Google'}
            </Button>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="body2" color="text.secondary" align="center">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </CardContent>
        </Card>

        <Typography variant="body2" color="text.secondary" align="center">
          Already have an account? <Link to="/login" style={{ textDecoration: 'none' }}>Sign In</Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default Register;