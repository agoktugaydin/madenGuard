const express = require('express');
const router = express.Router();
const { fetchDeviceIdsFromDatabase } = require('../controllers/dataController');

router.get('/deviceIds', async (req, res) => {
    try {
        const deviceIds = await fetchDeviceIdsFromDatabase();
        res.json(deviceIds);
    } catch (error) {
        console.error('Error fetching device IDs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
