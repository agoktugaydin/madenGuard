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
import { apiUrl, apiPort } from '../constants';

const CustomerDetailsPage = ({ isLoggedIn }) => {
    const { customerId } = useParams();
    const [customer, setCustomer] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchCustomer();
    }, []);

    const fetchCustomer = async () => {
        try {
            // Retrieve the token from localStorage or state
            const token = localStorage.getItem('token');

            // Set the headers with the token
            const headers = {
                Authorization: `${token}`,
            };
            const response = await axios.get(`${apiUrl}:${apiPort}/api/user/${customerId}`, { headers });
            setCustomer(response.data);
        } catch (error) {
            console.error('Error fetching customer:', error);
            // Handle errors or show a user-friendly message
        }
    };

    const handleEdit = () => {
        navigate(`/customer-edit/${customerId}`);
    };

    const handleDelete = async () => {
        try {
            const confirmDelete = window.confirm('Are you sure to delete this customer?');

            if (confirmDelete) {
                await axios.delete(`${apiUrl}:${apiPort}/api/customer/${customerId}`);
                setSnackbarMessage('Customer deleted successfully!');
                setSnackbarOpen(true);
                navigate('/customer-list');
            }
        } catch (error) {
            console.error('Error deleting customer:', error);
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    return (
        <Container maxWidth="xl">
            <Typography variant="h4" gutterBottom>
                Customer Details
            </Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Customer ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow key={customer.customerId}>
                            <TableCell>{customer.userId}</TableCell>
                            <TableCell>{customer.name}</TableCell>
                            <TableCell>{customer.email}</TableCell>
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

export default CustomerDetailsPage;
