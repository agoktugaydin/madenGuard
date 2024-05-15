import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Snackbar,
  MenuItem,
  Select,
  Paper,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import axios from 'axios';
import FormInput from '../../src/components/FormInput';
import SubmitButton from '../../src/components/SubmitButton';
import { useNavigate } from 'react-router-dom';
const { apiUrl, apiPort } = require('../constants.js');

const RegisterDevice = ({ isLoggedIn }) => {
  const [formData, setFormData] = useState({
    masterId: '',
    title: '',
    zone: '',
    status: '',
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [masterDevices, setMasterDevices] = useState([]);
  const [masterTitles, setMasterTitles] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      // Redirect to the login page
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    // Fetch master devices and titles
    fetchDevicesAndExtractMasters();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const fetchDevicesAndExtractMasters = async () => {
    try {
      // Retrieve the token from localStorage or state
      const token = localStorage.getItem('token');

      // Set the headers with the token
      const headers = {
        Authorization: `${token}`,
      };

      const response = await axios.get(`${apiUrl}:${apiPort}/api/device`, { headers });

      // Extract master devices with type "master"
      const masterDevices = response.data.filter((device) => device.type === 'master');
      setMasterDevices(masterDevices);

      // Extract titles and masterIds of master devices
      const masterTitles = [
        // Add "None" option
        { title: 'This Device Is Master', masterId: 'None' },
        // Add titles and masterIds of master devices
        ...masterDevices.map((device) => ({
          title: device.title,
          masterId: device.deviceId, // Assuming deviceId is used as masterId
        })),
      ];

      setMasterTitles(masterTitles);

      // If there are master devices, set the default master title in the form data
      if (masterTitles.length > 1) {
        setFormData((prevData) => ({
          ...prevData,
          masterId: masterTitles[0].masterId,
        }));
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      // Handle errors or show a user-friendly message
    }
  };

  const handleSubmit = async () => {
    try {
      // Retrieve the token from localStorage or state
      const token = localStorage.getItem('token');

      // Set the headers with the token
      const headers = {
        Authorization: `${token}`,
      };

      // Include masterId in the form data for registration
      const registrationData = {
        ...formData,
        masterId: formData.masterId == 'None' ? '' : formData.masterId,
      };

      const response = await axios.post(`${apiUrl}:${apiPort}/api/device`, registrationData, {
        headers,
      });
      console.log('Device registered:', response.data);

      // Clear form fields
      setFormData({
        masterId: masterTitles.length > 0 ? masterTitles[0].masterId : '', // Set default masterId
        title: '',
        zone: '',
        status: '',
      });

      // Show success message
      setSnackbarMessage('Device registered successfully!');
      setSnackbarOpen(true);

      // Automatically navigate after a delay (e.g., 2000 milliseconds = 2 seconds)
      setTimeout(() => {
        navigate(`/device-details/${response.data.deviceId}`);
      }, 1000);
    } catch (error) {
      console.error('Error registering device:', error);
      // Handle errors or show a user-friendly message
    }
  };

  return (
    <Container maxWidth="md" sx={{ paddingTop: 4 }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom>
          Register Device
        </Typography>
        <form>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Select
                fullWidth
                label="Master Title"
                name="masterId"
                value={formData.masterId}
                onChange={handleChange}
              >
                {masterTitles.map((title) => (
                  <MenuItem key={title.masterId} value={title.masterId}>
                    {title.title}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12}>
              <FormInput label="Title" name="title" value={formData.title} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <FormInput label="Zone" name="zone" value={formData.zone} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <FormInput label="Status" name="status" value={formData.status} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <SubmitButton fullWidth label="Register" onClick={handleSubmit} />
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity="success"
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default RegisterDevice;
