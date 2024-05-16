import React, { useState, useEffect } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Snackbar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import ActivateIcon from '@mui/icons-material/PlayArrow';
import DeactivateIcon from '@mui/icons-material/Stop';
import axios from 'axios';
import MuiAlert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';
import { apiUrl, apiPort } from '../constants';

// const label = { inputProps: { 'aria-label': 'Switch demo' } };

const ListDevicesPage = ({ isLoggedIn }) => {
  const [devices, setDevices] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const navigate = useNavigate();

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const fetchDevices = async () => {
    try {
      // Retrieve the token from localStorage or state
      const token = localStorage.getItem('token');

      // Set the headers with the token
      const headers = {
        Authorization: `${token}`,
      };

      const response = await axios.get(`${apiUrl}:${apiPort}/api/device`, { headers });
      setDevices(response.data);
    } catch (error) {
      console.error('Error fetching devices:', error);
      // Handle errors or show a user-friendly message
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      // Redirect to the login page
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  const handleDetails = (deviceId) => {
    // Redirect to device details page
    navigate(`/device-details/${deviceId}`);
  };

  const handleEdit = (deviceId) => {
    // Redirect to device edit page
    navigate(`/device-edit/${deviceId}`);
  };

  const handleDelete = async (deviceId) => {
    try {
      // Retrieve the token from localStorage or state
      const token = localStorage.getItem('token');

      // Set the headers with the token
      const headers = {
        Authorization: `${token}`,
      };

      // Prompt user for confirmation
      const confirmDelete = window.confirm('Are you sure to delete this device?');

      if (confirmDelete) {
        // Send DELETE request to backend
        await axios.delete(`${apiUrl}:${apiPort}/api/device/${deviceId}`, { headers });
        setSnackbarMessage('Device deleted successfully!');
        setSnackbarOpen(true);
        // Refetch devices after deletion
        fetchDevices();
      }
    } catch (error) {
      console.error('Error deleting device:', error);
      // Handle errors or show a user-friendly message
    }
  };

  // cihazi aktive et
  const handleActivate = async (deviceId) => {
    try {
      // Retrieve the token from localStorage or state
      const token = localStorage.getItem('token');

      // Set the headers with the token
      const headers = {
        Authorization: `${token}`,
      };

      // Prompt user for confirmation
      const confirmActivate = window.confirm('Are you sure to activate this device?');

      if (confirmActivate) {
        // Send POST request to backend

        await axios.post(`${apiUrl}:${apiPort}/api/activate-device/${deviceId}`, { headers });
        setSnackbarMessage('Device activated successfully!');
        setSnackbarOpen(true);
        // Refetch devices after activation
        fetchDevices();
      }
    } catch (error) {
  
      console.error('Error activating device:', error);
      // Handle errors or show a user-friendly message
    }
  };

  // cihazi deaktive et
  const handleDeactivate = async (deviceId) => {
    try {
      // Retrieve the token from localStorage or state
      const token = localStorage.getItem('token');

      // Set the headers with the token
      const headers = {
        Authorization: `${token}`,
      };

      // Prompt user for confirmation
      const confirmDeactivate = window.confirm('Are you sure to deactivate this device?');

      if (confirmDeactivate) {
        // Send POST request to backend
        await axios.post(`${apiUrl}:${apiPort}/api/deactivate-device/${deviceId}`, { headers });
        setSnackbarMessage('Device deactivated successfully!');
        setSnackbarOpen(true);
        // Refetch devices after deactivation
        fetchDevices();
      }
    } catch (error) {
      console.error('Error deactivating device:', error);
      // Handle errors or show a user-friendly message
    }
  };


  // Check if at least one device has an "ownerId"
  const hasOwnerIds = devices.some(device => device.ownerId);

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        Device List
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Device ID</TableCell>
              <TableCell>Master ID</TableCell>
              {hasOwnerIds && <TableCell>Owner ID</TableCell>}
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Zone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.map((device) => (
              <TableRow key={device.deviceId}>
                <TableCell>{device.deviceId}</TableCell>
                <TableCell>{device.masterId || '-'}</TableCell>
                {hasOwnerIds && <TableCell>{device.ownerId}</TableCell>}
                <TableCell>{device.title}</TableCell>
                <TableCell>{device.type}</TableCell>
                <TableCell>{device.zone}</TableCell>
                <TableCell>{device.status}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleDetails(device.deviceId)}>
                    <InfoIcon />
                  </IconButton>
                  <IconButton color="primary" onClick={() => handleEdit(device.deviceId)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => handleDelete(device.deviceId)}>
                    <DeleteIcon />
                  </IconButton>
                  <IconButton color="primary" onClick={() => handleActivate(device.deviceId)}>
                    <ActivateIcon />
                  </IconButton>

                  <IconButton color="primary" onClick={() => handleDeactivate(device.deviceId)}>
                    <DeactivateIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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

export default ListDevicesPage;

