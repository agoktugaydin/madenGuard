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

const RegisterCustomer = ({ isLoggedIn }) => {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        password: '',
    });

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            // Redirect to the login page
            navigate('/login');
        }
    }, [isLoggedIn, navigate]);

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
            // Retrieve the token from localStorage or state
            const token = localStorage.getItem('token');

            // Set the headers with the token
            const headers = {
                Authorization: `${token}`,
            };


            const registrationData = {
                ...formData,
            };

            const response = await axios.post('http://localhost:3001/api/user', registrationData, {
                headers,
            });
            console.log('Customer registered:', response.data);

            // Clear form fields
            setFormData({
                name: '',
                surname: '',
                email: '',
                password: '',
            });

            // Show success message
            setSnackbarMessage('Device registered successfully!');
            setSnackbarOpen(true);

            // // Automatically navigate after a delay (e.g., 2000 milliseconds = 2 seconds)
            // setTimeout(() => {
            //     navigate(`/device-details/${response.data.deviceId}`);
            // }, 1000);
        } catch (error) {
            console.error('Error registering device:', error);
            // Handle errors or show a user-friendly message
        }
    };

    return (
        <Container maxWidth="md" sx={{ paddingTop: 4 }}>
            <Paper elevation={3} sx={{ padding: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Register Customer
                </Typography>
                <form>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                        </Grid>
                        <Grid item xs={12}>
                            <FormInput label="Name" name="name" value={formData.name} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <FormInput label="Surname" name="surname" value={formData.surname} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <FormInput label="E-Mail" name="email" value={formData.email} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <FormInput label="Password" name="password" value={formData.password} onChange={handleChange} />
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

export default RegisterCustomer;
