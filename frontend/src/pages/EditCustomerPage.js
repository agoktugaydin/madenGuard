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
import FormInput from '../components/FormInput';
import SubmitButton from '../components/SubmitButton';
import { useParams, useNavigate } from 'react-router-dom';
import { apiUrl, apiPort } from '../constants';

const EditCustomerPage = ({ isLoggedIn }) => {
    const { customerId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
    });

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useEffect(() => {
        if (!isLoggedIn) {
            // Redirect to the login page
            navigate('/login');
        }
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        fetchCustomerDetails();
    }, []);

    const fetchCustomerDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                Authorization: `${token}`,
            };
            const response = await axios.get(`${apiUrl}:${apiPort}/api/customer/${customerId}`, { headers });
            setFormData(response.data);
        } catch (error) {
            console.error('Error fetching customer details:', error);
        }
    };

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
            const token = localStorage.getItem('token');
            const headers = {
                Authorization: `${token}`,
            };
            const response = await axios.put(`${apiUrl}:${apiPort}/api/user/${customerId}`, formData, { headers });
            console.log('Customer updated:', response.data);
            setSnackbarMessage('Customer updated successfully!');
            setSnackbarOpen(true);
            setTimeout(() => {
                navigate(`/customer-details/${customerId}`);
            }, 1000);
        } catch (error) {
            console.error('Error updating customer:', error);
        }
    };

    return (
        <Container maxWidth="md" sx={{ paddingTop: 4 }}>
            <Paper elevation={3} sx={{ padding: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Update Customer
                </Typography>
                <form>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormInput label="Name" name="name" value={formData.name} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <FormInput label="Email" name="email" value={formData.email} onChange={handleChange} />
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

export default EditCustomerPage;
