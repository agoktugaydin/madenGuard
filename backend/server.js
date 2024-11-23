const express = require('express');
const https = require('https');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const dataRoutes = require('./routes/dataRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const userRoutes = require('./routes/userRoutes');
const tunnelRoutes = require('./routes/tunnelRoutes');
const { connectToMongoDB } = require('./config/dbConfig');
const { saveToTimeSeriesDatabase, updateDeviceStatus, updateIsDeviceConnected } = require('./controllers/dataController');
const fs = require('fs');

const app = express();
const httpServer = http.createServer(app);
// add ssl to server
// const httpsServer = https.createServer({
//     key: fs.readFileSync('./ssl/key.pem'),
//     cert: fs.readFileSync('./ssl/cert.pem'),
// }, app);
// const wss = new WebSocket.Server({ server });
const wss = new WebSocket.Server({
    host: process.env.HOST,
    port: process.env.PORT
});

const connectedDevices = new Map(); 

// MongoDB connection
connectToMongoDB();

// Middleware
app.use(cors());
app.use(express.json());

wss.on('connection', (ws) => {
    ws.send('Welcome to the WebSocket server!')
    console.log('New WebSocket connection');
    ws.on('message', async (data) => {
        try {
            const message = JSON.parse(data);
            switch (message.type) {
                case 'login':
                    const { deviceId } = message;
                    if (connectedDevices.has(deviceId)) {
                        ws.send(JSON.stringify({ type: 'login_error', message: 'Device is already connected' }));
                        break;
                    } else {
                        await updateIsDeviceConnected(deviceId, true);
                        await updateDeviceStatus(deviceId, 'deactive');
                    }
                    connectedDevices.set(deviceId, ws);
                    ws.send(JSON.stringify({ type: 'login_success' }));
                    break;
                case 'sensor_data':
                    saveToTimeSeriesDatabase(message, wss);
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });


    ws.on('close', () => {
        for (const [deviceId, socket] of connectedDevices.entries()) {
            if (socket === ws) {
                console.log(`Device ${deviceId} disconnected`);
                removeDeviceFromConnectedDevices(deviceId);
                updateIsDeviceConnected(deviceId, false); 
                updateDeviceStatus(deviceId, 'deactive');
                break;
            }
        }
    });
});

app.get('/', (req, res) => {
    const mesaj = "wait for it";
    res.send(mesaj);
});


app.get('/api/connected-devices', (req, res) => {
    const devices = getConnectedDevices();
    res.json(devices);
});

app.get('/api/device-status/:deviceId', (req, res) => {
    const { deviceId } = req.params;
    const isConnected = isDeviceConnected(deviceId);
    res.json({ deviceId, isConnected });
});

app.post('/api/activate-device/:deviceId', (req, res) => {
    const { deviceId } = req.params;
    activateDevice(deviceId);
    const ws = connectedDevices.get(deviceId);
    if (ws) {
        ws.send(JSON.stringify({ type: 'command', command: 'activate' }));
    }
    res.json({ deviceId, status: 'active' });
});

app.post('/api/deactivate-device/:deviceId', (req, res) => {
    const { deviceId } = req.params;
    updateDeviceStatus(deviceId, 'deactive');
    const ws = connectedDevices.get(deviceId);
    if (ws) {
        ws.send(JSON.stringify({ type: 'command', command: 'deactivate' }));
    }
    res.json({
        deviceId, status: 'deactive'
    });
}
);

app.post('/api/send-command/:deviceId', (req, res) => {
    const { deviceId } = req.params;
    const { command } = req.body;
    const ws = connectedDevices.get(deviceId);
    if (ws) {
        ws.send(JSON.stringify({ type: 'command', command }));
        res.json({ message: 'Command sent' });
    } else {
        res.status(404).json({ message: 'Device not connected' });
    }
}
);


// Routes
app.use('/api', dataRoutes);
app.use('/api', deviceRoutes);
app.use('/api', userRoutes);
app.use('/api', tunnelRoutes);

// Start the server
const PORT = 3001 //process.env.PORTHTTPS || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

httpsServer.listen(443, () => {
    console.log('Server is running on port 443');
}
);

// Helper functions to manage connected devices
function getConnectedDevices() {
    return Array.from(connectedDevices.keys());
}

function isDeviceConnected(deviceId) {
    return connectedDevices.has(deviceId);
}

// cihazi bagli olan cihazlar listesinden cikar
function removeDeviceFromConnectedDevices(deviceId) {
    connectedDevices.delete(deviceId);
}

// cihazi aktif hale getir
function activateDevice(deviceId) {
    updateDeviceStatus(deviceId, 'active');
}
