const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: [true, "Please provide a device id."],
        unique: [true, "Device id must be unique."],
      },
    masterId: String,
    ownerId: String,
    title: String,
    type: String,
    zone: String,
    status: String,
    isConnected: Boolean
});

// Check if the model already exists to avoid redefining it
const DeviceData = mongoose.models.DeviceData || mongoose.model('DeviceData', deviceSchema);

module.exports = DeviceData;
