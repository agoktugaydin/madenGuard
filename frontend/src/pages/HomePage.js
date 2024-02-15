import React from 'react';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const SquareComponent = ({ title, description }) => (
  <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    <Typography variant="body2" color="textSecondary">
      {description}
    </Typography>
  </Paper>
);

const HomePage = ({ isLoggedIn }) => (
  <Container maxWidth="md" sx={{ paddingTop: 4 }}>
    <Typography variant="h4" align="center" gutterBottom>
      MadenGuard
    </Typography>

    <Box sx={{ display: 'flex', justifyContent: 'space-around', marginTop: 4 }}>
      <SquareComponent
        title="What We Do"
        description="Our system aims to prevent gas poisoning and potential explosions in mining sites. It continuously monitors temperature, carbon monoxide, and combustible gas levels, providing timely alarms when necessary."
      />
      <SquareComponent
        title="Why Choose Us"
        description="We prioritize safety by actively measuring environmental conditions. Our system ensures a secure mining environment, detecting gas hazards and taking preventive measures to safeguard workers and assets."
      />
      <SquareComponent
        title="Our Mission"
        description="We strive to create a safer mining experience. Our technology not only monitors real-time data but also allows access to historical information for in-depth analysis, enhancing safety protocols and decision-making processes."
      />
    </Box>

    {!isLoggedIn && (
      <Box sx={{ textAlign: 'center', marginTop: 4 }}>
        <Button component={Link} to="/login" variant="contained" color="primary">
          Login
        </Button>
      </Box>
    )}
  </Container>
);

export default HomePage;
