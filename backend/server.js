const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3001;

// MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/your_database');
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Mongoose şemasını tanımlayın
const timeseriesSchema = new mongoose.Schema({
    deviceId: String,
    gasIntensity: Number,
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number], // [longitude, latitude]
    },
    timestamp: { type: Date, default: Date.now },
});

// Şemayı indeksleyin
timeseriesSchema.index({ location: '2dsphere' });

// Mongoose modelini oluşturun
const TimeSeriesData = mongoose.model('TimeSeriesData', timeseriesSchema);

// WebSocket bağlantısı
io.on('connection', (socket) => {
    console.log('WebSocket Client Connected');

    // WebSocket üzerinden veri alındığında
    socket.on('message', (data) => {
        console.log(`Received message from WebSocket client: ${JSON.stringify(data)}`);

        // Gelen veriyi MongoDB Time Series Database'e kaydetme
        saveToTimeSeriesDatabase(data);
    });
});

// HTTP GET isteği (Örnek: Long Polling)
app.get('/api/data', async (req, res) => {
    try {
        // MongoDB'den veri çekme
        const data = await fetchDataFromDatabase();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Veriyi MongoDB Time Series Database'e kaydetme fonksiyonu
async function saveToTimeSeriesDatabase(data) {
    try {
        // Gelen verinin coordinates alanındaki değerleri kontrol et
        if (typeof data.latitude !== 'number' || typeof data.longitude !== 'number') {
            throw new Error('Geçersiz koordinat değerleri');
        }

        // Yeni bir TimeSeriesData belgesi oluşturun
        const newData = new TimeSeriesData({
            deviceId: data.deviceId,
            gasIntensity: data.gasIntensity,
            location: {
                coordinates: [data.longitude, data.latitude],
            },
        });

        // Belgeyi veritabanına kaydedin
        const savedData = await newData.save();
        console.log('Veri MongoDB Time Series Database\'e kaydedildi:', savedData);
    } catch (error) {
        console.error('Veri kaydetme hatası:', error);
    }
}


// MongoDB'den veri çekme
async function fetchDataFromDatabase() {
    // Veritabanından veri çekme işlemleri burada gerçekleştirilir
    // Örnek olarak, bir Mongoose modeli kullanabilirsiniz
    return { message: 'Hello from server!' };
}

// HTTP sunucusunu başlatma
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
