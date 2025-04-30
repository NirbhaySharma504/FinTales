import { useNavigate } from 'react-router-dom';
import { Button, Tooltip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../contexts/AuthContext';

const LogoutButton = ({ variant = 'contained', fullWidth = false }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Tooltip title="See you soon!" arrow>
      <Button
        variant={variant}
        color="secondary"
        onClick={handleLogout}
        startIcon={<LogoutIcon />}
        fullWidth={fullWidth}
        sx={{
          borderRadius: '12px',
          fontWeight: 'bold',
          background: 'linear-gradient(to right, #f97316, #f43f5e)',
          color: 'white',
          px: 3,
          py: 1.2,
          textTransform: 'none',
          ':hover': {
            background: 'linear-gradient(to right, #ea580c, #e11d48)',
          },
        }}
      >
        Log Out
      </Button>
    </Tooltip>
  );
};

export default LogoutButton;
