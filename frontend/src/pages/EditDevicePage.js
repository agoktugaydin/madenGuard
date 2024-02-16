import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Snackbar, MenuItem, Select, Paper } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import axios from 'axios';
import FormInput from '../components/FormInput';
import SubmitButton from '../components/SubmitButton';
import { useParams, useNavigate } from 'react-router-dom';

const EditDevicePage = ({ isLoggedIn }) => {
  const { deviceId } = useParams(); // Get the deviceId from the route params
  const navigate = useNavigate();

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

  useEffect(() => {
    if (!isLoggedIn) {
      // Redirect to the login page
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    // Fetch device details based on deviceId when the component mounts
    const fetchDeviceDetails = async () => {
      try {
        // Retrieve the token from localStorage or state
        const token = localStorage.getItem('token');

        // Set the headers with the token
        const headers = {
          Authorization: `${token}`,
        };

        const response = await axios.get(`http://localhost:3001/api/device/${deviceId}`, { headers });
        // Populate the form with existing device details
        const newFormData = response.data;
        if(!newFormData.masterId){ // make the selected option None
          newFormData.masterId = 'None';
        }
        setFormData(newFormData);
      } catch (error) {
        console.error('Error fetching device details:', error);
        // Handle errors or show a user-friendly message
      }
    };

    // Fetch master devices and titles
    const fetchMasterDevices = async () => {
      try {
        // Retrieve the token from localStorage or state
        const token = localStorage.getItem('token');

        // Set the headers with the token
        const headers = {
          Authorization: `${token}`,
        };

        const response = await axios.get('http://localhost:3001/api/device', { headers });

        // Extract master devices with type "master" excluding the device being edited
        const masterDevices = response.data.filter(
          (device) => device.type === 'master' && device.deviceId !== deviceId
        );
        setMasterDevices(masterDevices);

      // Extract titles and masterIds of master devices
      const masterTitles = [
        // Add "None" option
        { title: 'None', masterId: 'None' },
        // Add titles and masterIds of master devices
        ...masterDevices.map((device) => ({
          title: device.title,
          masterId: device.deviceId, // Assuming deviceId is used as masterId
        })),
      ];
        setMasterTitles(masterTitles);
      } catch (error) {
        console.error('Error fetching devices:', error);
        // Handle errors or show a user-friendly message
      }
    };

    fetchDeviceDetails();
    fetchMasterDevices();
  }, [deviceId]); // Dependency on deviceId to refetch when it changes

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleSubmit = async () => {
    try {
      // Send PUT request to update the existing device
      const updatedFormData = { ...formData };

      // If "None" is selected, omit masterId from the payload
      if (formData.masterId === "None") {
        delete updatedFormData.masterId;
      }

      // Retrieve the token from localStorage or state
      const token = localStorage.getItem('token');

      // Set the headers with the token
      const headers = {
        //Authorization: `Bearer ${token}`,
        Authorization: `${token}`,
      };

      // Send PUT request to update the existing device
      const response = await axios.put(`http://localhost:3001/api/device/${deviceId}`, updatedFormData, {headers});
      console.log('Device updated:', response.data);

      // Show success message
      setSnackbarMessage('Device updated successfully!');
      setSnackbarOpen(true);

    // Automatically navigate after a delay (e.g., 2000 milliseconds = 2 seconds)
    setTimeout(() => {
      navigate(`/device-details/${deviceId}`);
    }, 1000);

      // You can add additional logic or redirect the user after successful update
    } catch (error) {
      console.error('Error updating device:', error);
      // Handle errors or show a user-friendly message
    }
  };

  return (
    <Container maxWidth="md" sx={{ paddingTop: 4 }}>
    <Paper elevation={3} sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Update Device
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
            <SubmitButton fullWidth label="Update" onClick={handleSubmit} />
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

export default EditDevicePage;
