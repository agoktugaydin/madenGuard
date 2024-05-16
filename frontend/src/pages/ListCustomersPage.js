import React, { useState, useEffect } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Snackbar } from '@mui/material';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { apiUrl, apiPort } from '../constants';

const ListCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const navigate = useNavigate();

  const fetchCustomers = async () => {
    try {
      // Retrieve the token from localStorage or state
      const token = localStorage.getItem('token');

      // Set the headers with the token
      const headers = {
        Authorization: `${token}`,
      };

      const response = await axios.get(`${apiUrl}:${apiPort}/api/user`, {headers});
      const filteredCustomers = response.data.filter(user => user.role === 'ROLE_CUSTOMER');
      setCustomers(filteredCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Handle errors or show a user-friendly message
      navigate('/');
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDetails = (userId) => {
    // Handle details action
    console.log(`Details clicked for user with ID: ${userId}`);
    // Redirect to customer details page
    navigate(`/customer-details/${userId}`);
    // You can add your navigation logic here
  };

  const handleEdit = (userId) => {
    // Handle edit action
    console.log(`Edit clicked for user with ID: ${userId}`);
    // You can add your navigation logic here
    navigate(`/customer-edit/${userId}`);
  };

  const handleDelete = async (userId) => {
    try {
      // Retrieve the token from localStorage or state
      const token = localStorage.getItem('token');

      // Set the headers with the token
      const headers = {
        Authorization: `${token}`,
      };

      // Prompt user for confirmation
      const confirmDelete = window.confirm('Are you sure to delete this customer?');

      if (confirmDelete) {
        // Send DELETE request to backend
        await axios.delete(`${apiUrl}:${apiPort}/api/user/${userId}`, { headers });
        setSnackbarMessage('Customer deleted successfully!');
        setSnackbarOpen(true);
        // Refetch customers after deletion
        await fetchCustomers();
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        Customer List
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Surname</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer._id}>
                <TableCell>{customer.userId}</TableCell>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.surname}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleDetails(customer.userId)}>
                    <InfoIcon />
                  </IconButton>
                  <IconButton color="primary" onClick={() => handleEdit(customer.userId)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => handleDelete(customer.userId)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ListCustomersPage;
