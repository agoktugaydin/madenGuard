const express = require('express');
const router = express.Router();
const { saveUser, updateUser, getUserById, getAllUsers, deleteUserById, deleteAllUsers, 
    loginUser, registerAdmin} = require('../controllers/userDataController');
const {isTokenValid} = require('../utils/jwtUtils');

router.get('/userIds', async (req, res) => {
    try {
        const userIds = await fetchUserIdsFromDatabase();
        res.json(userIds);
    } catch (error) {
        console.error('Error fetching user IDs:', error);
        res.status(500).json({ error: 'Internal Server Error' , message: error.message });
    }
});

router.get('/user', async (req, res) => {
    try {

        const token = req.headers.authorization; // req.headers["authorization"];
        isTokenValid(token);

        const data = await getAllUsers(token);
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' , message: error.message });
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const token = req.headers.authorization; // req.headers["authorization"];
        isTokenValid(token);

        const userId = req.params.userId;
        const data = await getUserById(userId, token);
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' , message: error.message });
    }
});

router.post('/user', async (req, res) => {
    try {
        const token = req.headers.authorization; // req.headers["authorization"];
        isTokenValid(token);

        const savedUser = await saveUser(req.body, token);
        res.json(savedUser);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

router.put('/user/:userId', async (req, res) => {
    try {
        const token = req.headers.authorization; // req.headers["authorization"];
        isTokenValid(token);

        const userId = req.params.userId;
        const data = await updateUser(req.body, userId, token);
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' , message: error.message });
    }
});

router.delete('/user/:userId', async (req, res) => {
    try {
        const token = req.headers.authorization; // req.headers["authorization"];
        isTokenValid(token);

        const userId = req.params.userId;
        const data = await deleteUserById(userId, token);
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});


router.delete('/user', async (req, res) => {
    try {
        const token = req.headers.authorization; // req.headers["authorization"];
        isTokenValid(token);
        
        await deleteAllUsers(token);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' , message: error.message });
    }
});

router.post('/user/login', async (req, res) => {
    try {
        const response = await loginUser(req.body);
        res.json(response);
    } catch (error) {
        console.error('Error logging user in:', error);
        res.status(500).json({ error: 'Internal Server Error' , message: error.message });
    }
});

router.post('/user/registerAdmin', async (req, res) => {
    try {
        const apiKey = req.headers.apikey; // req.headers["apikey"];
        const savedUser = await registerAdmin(req.body, apiKey);
        res.json(savedUser);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

module.exports = router;
