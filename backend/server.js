const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dataRoutes = require('./routes/dataRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const { connectToMongoDB } = require('./config/dbConfig');
const { saveToTimeSeriesDatabase } = require('./controllers/dataController');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// MongoDB connection
connectToMongoDB();

// Middleware
app.use(cors());
app.use(express.json());

// WebSocket connection
io.on('connection', (socket) => {
    console.log('WebSocket Client Connected');

    // Pass the io object to the saveToTimeSeriesDatabase function
    socket.on('message', (data) => {
        console.log(`Received message from WebSocket client: ${JSON.stringify(data)}`);

        // Call the saveToTimeSeriesDatabase function and pass the io object
        saveToTimeSeriesDatabase(data, io);
    });
});

// Routes
app.use('/api', dataRoutes);
app.use('/api', deviceRoutes);

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
