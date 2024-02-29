const express = require('express');
const https = require('https');
const WebSocket = require('ws');
const cors = require('cors');
const dataRoutes = require('./routes/dataRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const userRoutes = require('./routes/userRoutes');
const { connectToMongoDB } = require('./config/dbConfig');
const { saveToTimeSeriesDatabase } = require('./controllers/dataController');
const fs = require('fs');

const app = express();

const server = https.createServer({
    key: fs.readFileSync('./ssl/key.pem'),
    cert: fs.readFileSync('./ssl/cert.pem'),
    // host: process.env.HOST,
    // port: process.env.PORT,
},
    app);
// const wss = new WebSocket.Server({ server });
const wss = new WebSocket.Server({
    server,
});

// MongoDB connection
connectToMongoDB();

// Middleware
// app.use(cors());
app.use(express.json());

wss.on('connection', (ws) => {
    ws.send('Welcome to the WebSocket server!')
    console.log('WebSocket Client Connected');
    ws.on('message', (data) => {
        try {
            saveToTimeSeriesDatabase(JSON.parse(data), wss);
        } catch (error) {
            console.error('Error processing message:', error);
            // to do
        }
    });
});

// Routes
app.use('/api', dataRoutes);
app.use('/api', deviceRoutes);
app.use('/api', userRoutes);

// Start the server
const PORT = process.env.PORTHTTP || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
