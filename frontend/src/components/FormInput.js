import React from 'react';
import { TextField, Grid } from '@mui/material';

const FormInput = ({ label, name, value, placeholder, onChange }) => (
  <Grid item xs={12} sm={6}>
    <TextField
      fullWidth
      label={label}
      name={name}
      onChange={onChange}
      value={value}
      placeholder={placeholder}
    />
  </Grid>
);

export default FormInput;
