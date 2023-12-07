const express = require('express');
const router = express.Router();
const { fetchRecentDataFromDatabase } = require('../controllers/dataController');

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

module.exports = router;
