import { Box, Container, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: '#ffffff',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.03)'
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="#64748b" align="center">
          {'© '}
          {new Date().getFullYear()}
          {' '}
          <Link
            color="inherit"
            href="#"
            sx={{
              textDecoration: 'none',
              fontWeight: 500,
              color: '#3b82f6',
              '&:hover': {
                color: '#2563eb',
              }
            }}
          >
            FinTales
          </Link>
          {' - Financial Education for Teens'}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;