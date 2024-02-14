const express = require('express');
const router = express.Router();
const { fetchDeviceIdsFromDatabase, saveDevice, updateDevice, getDeviceById, getAllDevices, deleteDeviceById, deleteAllDevices } = require('../controllers/dataController');
const {isTokenValid} = require('../utils/jwtUtils');

router.get('/deviceIds', async (req, res) => {
    try {
        const deviceIds = await fetchDeviceIdsFromDatabase();
        res.json(deviceIds);
    } catch (error) {
        console.error('Error fetching device IDs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/device', async (req, res) => {
    try {
        const token = req.headers.authorization; // req.headers["authorization"];
        isTokenValid(token);

        const data = await getAllDevices(token);
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/device/:deviceId', async (req, res) => {
    try {
        const token = req.headers.authorization; // req.headers["authorization"];
        isTokenValid(token);

        const deviceId = req.params.deviceId;
        const data = await getDeviceById(deviceId, token);
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/device', async (req, res) => {
    try {
        const token = req.headers.authorization; // req.headers["authorization"];
        isTokenValid(token);

        const savedDevice = await saveDevice(req.body, token);
        res.json(savedDevice);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

router.put('/device/:deviceId', async (req, res) => {
    try {
        const token = req.headers.authorization; // req.headers["authorization"];
        isTokenValid(token);

        const deviceId = req.params.deviceId;
        const data = await updateDevice(req.body, deviceId, token);
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/device/:deviceId', async (req, res) => {
    try {
        const token = req.headers.authorization; // req.headers["authorization"];
        isTokenValid(token);

        const deviceId = req.params.deviceId;
        const data = await deleteDeviceById(deviceId, token);
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});


router.delete('/device', async (req, res) => {
    try {
        const token = req.headers.authorization; // req.headers["authorization"];
        isTokenValid(token);

        await deleteAllDevices(token);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
