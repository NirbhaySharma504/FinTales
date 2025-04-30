import { Box } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    }}>
      <Navbar />
      <Box component="main" sx={{ flex: '1 0 auto' }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;