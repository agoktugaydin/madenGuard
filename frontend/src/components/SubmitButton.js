import React from 'react';
import { Button, Grid } from '@mui/material';

const SubmitButton = ({ label,  onClick }) => (
  <Grid item xs={12}>
    <Button variant="contained" color="primary" onClick={onClick}>
      {label}
    </Button>
  </Grid>
);

export default SubmitButton;
