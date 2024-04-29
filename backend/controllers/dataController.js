const DeviceData = require('../models/DeviceData');
const TimeSeriesData = require('../models/TimeSeriesData');
const { randomUUID } = require('crypto');
const CONSTANTS = require('../utils/constants')
const {extractUserId} = require('../utils/jwtUtils');
const {extractUserRole} = require('../controllers/userDataController');
const WebSocket = require('ws');
const { connected } = require('process');

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

async function fetchAllDataFromDatabase(deviceId) {
    try {
        const data = await TimeSeriesData.find({
            deviceId,
        }).sort({ timestamp: 1 });

        return data;
    } catch (error) {
        console.error('Error fetching all data:', error);
        throw error;
    }
}
async function saveToTimeSeriesDatabase(data, io) {
    try {
        // Create a TimeSeriesData object for the first device
        const newData1 = new TimeSeriesData({
            deviceId: data.deviceId,
            gasIntensity: data.gasIntensity,
            zone: data.zone,
        });

        // Save the first data record
        const savedData1 = await newData1.save();
        console.log('Time series data saved to MongoDB Time Series Database:', savedData1);

        // Emit data update event for the first record
        io.emit('dataUpdate', savedData1);

        // Check if the message contains information for the second device
        if (data.deviceId2 && data.gasIntensity2 !== undefined && data.zone2) {
            // Create a TimeSeriesData object for the second device
            const newData2 = new TimeSeriesData({
                deviceId: data.deviceId2,
                gasIntensity: data.gasIntensity2,
                zone: data.zone2,
            });

            // Save the second data record
            const savedData2 = await newData2.save();
            console.log('Time series data saved to MongoDB Time Series Database:', savedData2);

            // Emit data update event for the second record
            io.emit('dataUpdate', savedData2);
        }
    } catch (error) {
        console.error('Error saving data:', error);
        throw error;
    }
}


async function fetchDeviceIdsFromDatabase() {
    try {
        const distinctDeviceIds = await DeviceData.distinct('deviceId');
        return distinctDeviceIds;
    } catch (error) {
        console.error('Error fetching device IDs:', error);
        throw error;
    }
}

async function getAllDevices(token) {
    try {
        const userRole = await extractUserRole(token);
        if(userRole == CONSTANTS.ADMIN) {
            const devices = await DeviceData.find({});

            console.log('Found devices data from MongoDB Time Series Database:', devices);
            return devices;
        } else if(userRole == CONSTANTS.CUSTOMER){
            const userId = extractUserId(token);
            const devices = await DeviceData.find({ownerId: userId });

            // Remove ownerId field from each device for CUSTOMER role
            const devicesWithoutOwner = devices.map(device => {
                const { ownerId, ...deviceWithoutOwner } = device.toObject();
                return deviceWithoutOwner;
            });

            console.log('Found devices data from MongoDB Time Series Database:', devicesWithoutOwner);
            return devicesWithoutOwner;
        } else {
            throw new Error('Requestor is not allowed to access this resource')
        }

    } catch (error) {
        console.error('Error retrieving device data:', error);
        throw error;
    }
}

async function getDeviceById(deviceId, token) {
    try {
        const userRole = await extractUserRole(token);
        if(userRole == CONSTANTS.ADMIN) {
            const device = await DeviceData.findOne({deviceId: deviceId});

            console.log('Found device data from MongoDB Time Series Database:', device);
            return device;
        } else if(userRole == CONSTANTS.CUSTOMER){
            const userId = extractUserId(token);
            const device = await DeviceData.findOne({deviceId: deviceId, ownerId: userId});

            console.log('Found device data from MongoDB Time Series Database:', device);
            const deviceObject = device.toObject();
            delete deviceObject.ownerId; // don't send the ownerId if the customer is requesting the device
            return deviceObject;
        } else {
            throw new Error('Requestor is not allowed to access this resource')
        }

    } catch (error) {
        console.error('Error retrieving device data:', error);
        throw error;
    }
}

async function saveDevice(data, token) {
    try {
        const userRole = await extractUserRole(token);
        if(userRole == CONSTANTS.ADMIN) {
            if(!data.ownerId){
                throw new Error("Owner id must be provided"); 
            }
            const newData = new DeviceData({
                deviceId: randomUUID(),
                ownerId: data.ownerId,
                title: data.title,
                type: "master",
                zone: data.zone,
                status: data.status,
                isConnected: data.isConnected
            });
    
            if(data.masterId) {
                const master = await DeviceData.findOne({ deviceId: data.masterId, ownerId: data.ownerId });
                if (!master) {
                    throw new Error("The master device or the ownership does not exist"); 
                } 
                newData.masterId = data.masterId;
                newData.type = "slave";
            }
    
            const savedData = await newData.save();
            console.log('Device data saved to MongoDB Time Series Database:', savedData);
            return savedData;

        } else if(userRole == CONSTANTS.CUSTOMER){
            const userId = extractUserId(token);

            const newData = new DeviceData({
                deviceId: randomUUID(),
                ownerId: userId,
                title: data.title,
                type: "master",
                zone: data.zone,
                status: data.status,
                isConnected: data.isConnected
            });
    
            if(data.masterId) {
                const master = await DeviceData.findOne({ deviceId: data.masterId, ownerId: userId });
                if (!master) {
                    throw new Error("The master device or the ownership does not exist"); 
                } 
                newData.masterId = data.masterId;
                newData.type = "slave";
            }
    
            const savedData = await newData.save();
            console.log('Device data saved to MongoDB Time Series Database:', savedData);
            return savedData;
        } else {
            throw new Error('Requestor is not allowed to access this resource')
        }

    } catch (error) {
        console.error('Error saving device data:', error);
        throw error;
    }
}

async function updateDeviceStatus(deviceId, newStatus) {
    try {
        const result = await DeviceData.findOneAndUpdate({ deviceId: deviceId }, { $set: { status: newStatus } }, { new: true });
        console.log('Device status updated:', result);

        return result;
    } catch (error) {
        console.error('Error updating device status:', error);
        throw error;
    }
}

async function updateDevice(device, deviceId, token) {
    try {
        const userRole = await extractUserRole(token);
        if(userRole == CONSTANTS.ADMIN) {
            if(!device.ownerId){
                throw new Error("Owner id must be provided"); 
            }

            // check if device exists
            const existingDevice = getDeviceById(deviceId, token);
            if(!existingDevice) {
                throw new Error('Device not found');
            }
            // create new object
            const updatedDevice = {
                ownerId: device.ownerId,
                title: device.title,
                type: "master",
                zone: device.zone,
                status: device.status,
                isConnected: data.isConnected
            };

            // check if master id provided and if given, check if the master exists in db
            if(device.masterId) {
                const master = await DeviceData.findOne({ deviceId: device.masterId, ownerId: device.ownerId });
                if (!master) {
                    throw new Error("The master device or the ownership does not exist"); 
                } 
                updatedDevice.masterId = device.masterId;
                updatedDevice.type = "slave";
            }
            
            // update the device with new data
            const result = await DeviceData.findOneAndUpdate({deviceId: deviceId}, {
                $set: updatedDevice
            });

            console.log('Device data updated to MongoDB Time Series Database:', result); // updatedDevice

            return result;
        } else if(userRole == CONSTANTS.CUSTOMER){
            const userId = extractUserId(token);

            // check if device exists
            const existingDevice = getDeviceById(deviceId, token);
            if(!existingDevice) {
                throw new Error('Device not found');
            }
            // create new object
            const updatedDevice = {
                ownerId: userId,
                title: device.title,
                type: "master",
                zone: device.zone,
                status: device.status,
                isConnected: data.isConnected
            };

            // check if master id provided and if given, check if the master exists in db
            if(device.masterId) {
                const master = await DeviceData.findOne({ deviceId: device.masterId, ownerId: userId });
                if (!master) {
                    throw new Error("The master device or the ownership does not exist"); 
                } 
                updatedDevice.masterId = device.masterId;
                updatedDevice.type = "slave";
            }
            
            // update the device with new data
            const result = await DeviceData.findOneAndUpdate({deviceId: deviceId}, {
                $set: updatedDevice
            });

            console.log('Device data updated to MongoDB Time Series Database:', result); // updatedDevice

            return result;
        } else {
            throw new Error('Requestor is not allowed to access this resource')
        }

    } catch (error) {
        console.error('Error updating device data:', error);
        throw error;
    }
}

async function deleteDeviceById(deviceId, token) {
    try {
        const userRole = await extractUserRole(token);
        if(userRole == CONSTANTS.ADMIN) {

            // const existingDevice = getDeviceById(deviceId);
            const result = await DeviceData.findOneAndDelete({ deviceId: deviceId});
            if(!result) {
                throw new Error('Device not found');
            }
            console.log('Device is deleted from database with id:', deviceId);

            return result;
        } else if(userRole == CONSTANTS.CUSTOMER){
            const userId = extractUserId(token);

            // const existingDevice = getDeviceById(deviceId);
            const result = await DeviceData.findOneAndDelete({ deviceId: deviceId, ownerId: userId });
            if(!result) {
                throw new Error('Device not found');
            }
            console.log('Device is deleted from database with id:', deviceId);

            return result;
        } else {
            throw new Error('Requestor is not allowed to access this resource')
        }

    } catch (error) {
        console.error('Error while deleting the device:', error);
        throw error;
    }
}

async function deleteAllDevices(token) {
    try {
        const userRole = await extractUserRole(token);
        if(userRole == CONSTANTS.ADMIN) {
            const result = await DeviceData.deleteMany({});
            console.log('Devices db is purged.');
    
            return result;
        } else if(userRole == CONSTANTS.CUSTOMER){
            const userId = extractUserId(token);

            const result = await DeviceData.deleteMany({ownerId: userId});
            console.log('Devices db is purged.');
    
            return result;
        } else {
            throw new Error('Requestor is not allowed to access this resource')
        }

    } catch (error) {
        console.error('Error while deleting devices :', error);
        throw error;
    }
}

module.exports = {
    fetchAllDataFromDatabase,
    fetchRecentDataFromDatabase,
    saveToTimeSeriesDatabase,
    fetchDeviceIdsFromDatabase,
    saveDevice,
    updateDevice,
    getDeviceById,
    getAllDevices,
    deleteDeviceById,
    deleteAllDevices,
    updateDeviceStatus
};
