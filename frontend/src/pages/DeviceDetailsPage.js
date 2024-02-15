// DeviceDetailsPage.js

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Snackbar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import MuiAlert from '@mui/material/Alert';
import { useParams, useNavigate } from 'react-router-dom';
import DataChart from '../components/DataChart';
import Slider from '@mui/material/Slider';
import DataTable from '../components/DataTable';

const DeviceDetailsPage = ({ isLoggedIn }) => {
  const { deviceId } = useParams();
  const [device, setDevice] = useState([]);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const navigate = useNavigate();

  const itemsPerPage = 10; // Tanımla itemsPerPage'ı

  useEffect(() => {
    fetchDevice();
    fetchData(currentPage);
  }, [deviceId, currentPage]);

  const fetchDevice = async () => {
    try {
      // Retrieve the token from localStorage or state
      const token = localStorage.getItem('token');

      // Set the headers with the token
      const headers = {
        Authorization: `${token}`,
      };
      const response = await axios.get(`http://localhost:3001/api/device/${deviceId}`, { headers });
      setDevice(response.data);
    } catch (error) {
      console.error('Error fetching device:', error);
      // Handle errors or show a user-friendly message
    }
  };


  const fetchData = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/allData?deviceId=${deviceId}`);
      setData(response.data.reverse());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchData(pageNumber);
  };

  const handleEdit = () => {
    navigate(`/device-edit/${deviceId}`);
  };

  const handleDelete = async () => {
    try {
      const confirmDelete = window.confirm('Are you sure to delete this device?');

      if (confirmDelete) {
        await axios.delete(`http://localhost:3001/api/device/${deviceId}`);
        setSnackbarMessage('Device deleted successfully!');
        setSnackbarOpen(true);
        navigate('/device-list');
      }
    } catch (error) {
      console.error('Error deleting device:', error);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const hasOwnerId = !!device.ownerId;
  const hasMasterId = !!device.masterId;

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        Device Details
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Device ID</TableCell>
              {hasMasterId && <TableCell>Master ID</TableCell>}
              {hasOwnerId && <TableCell>Owner ID</TableCell>}
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Zone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow key={device.deviceId}>
              <TableCell>{device.deviceId}</TableCell>
              {hasMasterId && <TableCell>{device.masterId}</TableCell>}
              {hasOwnerId && <TableCell>{device.ownerId}</TableCell>}
              <TableCell>{device.title}</TableCell>
              <TableCell>{device.type}</TableCell>
              <TableCell>{device.zone}</TableCell>
              <TableCell>{device.status}</TableCell>
              <TableCell>
                <IconButton color="primary" onClick={handleEdit}>
                  <EditIcon />
                </IconButton>
                <IconButton color="secondary" onClick={handleDelete}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <DataChart data={data} />

      <Slider
        value={currentPage}
        onChange={(_, value) => handlePageChange(value)}
        valueLabelDisplay="on"
        min={1}
        max={totalPages}
        step={1}
      />

      {/* <DataTable data={device} /> */}

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
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

export default DeviceDetailsPage;
