const mongoose = require('mongoose');

const timeseriesSchema = new mongoose.Schema({
    deviceId: String,
    gasIntensity: Number,
    zone: String,
    timestamp: { type: Date, default: Date.now },
});

const TimeSeriesData = mongoose.models.TimeSeriesData || mongoose.model('TimeSeriesData', timeseriesSchema);

module.exports = TimeSeriesData;
