const mongoose = require('mongoose');

const timeseriesSchema = new mongoose.Schema({
    deviceId: String,
    userId: String,
    gasIntensity: Number,
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number],
    },
    timestamp: { type: Date, default: Date.now },
});

timeseriesSchema.index({ location: '2dsphere', deviceId: 1, timestamp: 1 });

// Check if the model already exists to avoid redefining it
const TimeSeriesData = mongoose.models.TimeSeriesData || mongoose.model('TimeSeriesData', timeseriesSchema);

module.exports = TimeSeriesData;
