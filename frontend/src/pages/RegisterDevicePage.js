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
    selectedUser: '', // New state for admin only
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [masterDevices, setMasterDevices] = useState([]);
  const [masterTitles, setMasterTitles] = useState([]);
  const [users, setUsers] = useState([]); // New state for admin only

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

    // Fetch users for admins
    if (localStorage.getItem('role') === 'ROLE_ADMIN') {
      fetchUsers();
    }
  }, []);

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

      // Set the initial master devices
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

  const fetchUsers = async () => {
    try {
      // Retrieve the token from localStorage or state
      const token = localStorage.getItem('token');

      // Set the headers with the token
      const headers = {
        Authorization: `${token}`,
      };

      const response = await axios.get(`${apiUrl}:${apiPort}/api/user`, { headers });
      // Filter out users with ROLE_CUSTOMER
      const customers = response.data.filter(user => user.role === 'ROLE_CUSTOMER');
      setUsers(customers);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Handle errors or show a user-friendly message
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // If the selected user changes and it's not empty (i.e., a customer is selected)
    if (name === 'selectedUser' && value !== '') {
      // Filter master devices based on ownerId
      const customerMasterDevices = masterDevices.filter((device) => device.ownerId === value);
      setMasterDevices(customerMasterDevices);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleSubmit = async () => {
    try {
      // Retrieve the token from localStorage or state
      const token = localStorage.getItem('token');
      // Retrieve the userId from localStorage
      const userId = localStorage.getItem('userId');

      // Set the headers with the token
      const headers = {
        Authorization: `${token}`,
      };

      // Include masterId and ownerID in the form data for registration
      let registrationData = {
        ...formData,
        masterId: formData.masterId === 'None' ? '' : formData.masterId,
      };

      // If the user is an admin and a user is selected, use that user's ID as ownerID
      if (localStorage.getItem('role') === 'ROLE_ADMIN' && formData.selectedUser !== '') {
        registrationData = {
          ...registrationData,
          ownerId: formData.selectedUser,
        };
      } else {
        // Otherwise, use the logged-in user's ID as ownerID
        registrationData = {
          ...registrationData,
          ownerId: userId,
        };
      }

      const response = await axios.post(`${apiUrl}:${apiPort}/api/device`, registrationData, {
        headers,
      });
      console.log('Device registered:', response.data);

      // Clear form fields
      setFormData({
        masterId: masterTitles.length > 0 ? masterTitles[0].masterId : '', //Set default masterId
        title: '',
        zone: '',
        status: '',
        selectedUser: '', // Reset selectedUser field
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
            {localStorage.getItem('role') === 'ROLE_ADMIN' && (
              <Grid item xs={12}>
                <Select
                  fullWidth
                  label="Select User"
                  name="selectedUser"
                  value={formData.selectedUser}
                  onChange={handleChange}
                >
                  <MenuItem value="">Select User</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.userId} value={user.userId}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            )}
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

