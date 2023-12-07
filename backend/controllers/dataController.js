const TimeSeriesData = require('../models/TimeSeriesData');

async function fetchRecentDataFromDatabase(deviceId, timeRangeInSeconds) {
    const currentTime = new Date();
    const startTime = new Date(currentTime.getTime() - timeRangeInSeconds * 1000);

    try {
        const data = await TimeSeriesData.find({
            deviceId,
            timestamp: { $gte: startTime, $lte: currentTime },
        }).sort({ timestamp: 1 });

        return data;
    } catch (error) {
        console.error('Error fetching recent data:', error);
        throw error;
    }
}

// Pass the io object as a parameter
async function saveToTimeSeriesDatabase(data, io) {
    try {
        if (typeof data.latitude !== 'number' || typeof data.longitude !== 'number') {
            throw new Error('Invalid coordinate values');
        }

        const newData = new TimeSeriesData({
            deviceId: data.deviceId,
            userId: data.userId,
            gasIntensity: data.gasIntensity,
            location: {
                coordinates: [data.longitude, data.latitude],
            },
        });

        const savedData = await newData.save();
        console.log('Data saved to MongoDB Time Series Database:', savedData);

        // Use the io object to emit the event
        io.emit('dataUpdate', savedData);
    } catch (error) {
        console.error('Error saving data:', error);
        throw error;
    }
}

async function fetchDeviceIdsFromDatabase() {
    try {
        const distinctDeviceIds = await TimeSeriesData.distinct('deviceId');
        return distinctDeviceIds;
    } catch (error) {
        console.error('Error fetching device IDs:', error);
        throw error;
    }
}

module.exports = {
    fetchRecentDataFromDatabase,
    saveToTimeSeriesDatabase,
    fetchDeviceIdsFromDatabase,
};
