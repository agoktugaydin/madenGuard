const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const dataRoutes = require('./routes/dataRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const userRoutes = require('./routes/userRoutes');
const { connectToMongoDB } = require('./config/dbConfig');
const { saveToTimeSeriesDatabase } = require('./controllers/dataController');

const app = express();
const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });
const wss = new WebSocket.Server({
    host: process.env.HOST,
    port: process.env.PORTWS
});

// MongoDB connection
connectToMongoDB();

// Middleware
app.use(cors());
app.use(express.json());

wss.on('connection', (ws) => {
    console.log('WebSocket Client Connected');
    ws.on('message', (data) => {
        saveToTimeSeriesDatabase(JSON.parse(data), wss);
    });
});

// Routes
app.use('/api', dataRoutes);
app.use('/api', deviceRoutes);
app.use('/api', userRoutes);

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
