const express = require('express');
const router = express.Router();
const { fetchRecentDataFromDatabase, fetchAllDataFromDatabase } = require('../controllers/dataController');

// Endpoint to fetch recent data
router.get('/data', async (req, res) => {
    try {
        const deviceId = req.query.deviceId;
        const timeRangeInSeconds = req.query.timeRange || 30;
        const data = await fetchRecentDataFromDatabase(deviceId, timeRangeInSeconds);
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to fetch all data
router.get('/allData', async (req, res) => {
    try {
        const deviceId = req.query.deviceId;
        const data = await fetchAllDataFromDatabase(deviceId);
        res.json(data);
    } catch (error) {
        console.error('Error fetching all data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
