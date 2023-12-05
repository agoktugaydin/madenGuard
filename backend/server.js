const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT || 3001;

// MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/madenGuardDB');
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Mongoose şemasını tanımlayın
const timeseriesSchema = new mongoose.Schema({
    deviceId: String,
    userId: String, // Eklenen satır: Kullanıcı ID'si
    gasIntensity: Number,
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number], // [longitude, latitude]
    },
    timestamp: { type: Date, default: Date.now },
});

// Şemayı indeksleyin
timeseriesSchema.index({ location: '2dsphere', deviceId: 1, timestamp: 1 });

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

// HTTP GET isteği (Belirli bir süre içindeki verileri çekme)
app.get('/api/data', async (req, res) => {
    try {
        const deviceId = req.query.deviceId;
        const timeRangeInSeconds = req.query.timeRange || 30; // Varsayılan olarak son 30 saniye

        // MongoDB'den belirli bir süre içindeki veriyi çekme
        const data = await fetchRecentDataFromDatabase(deviceId, timeRangeInSeconds);

        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Belirli bir süre içindeki veriyi MongoDB Time Series Database'den çekme
async function fetchRecentDataFromDatabase(deviceId, timeRangeInSeconds) {
    const currentTime = new Date();
    const startTime = new Date(currentTime.getTime() - timeRangeInSeconds * 1000);

    const data = await TimeSeriesData.find({
        deviceId,
        timestamp: { $gte: startTime, $lte: currentTime },
    }).sort({ timestamp: 1 });

    return data;
}

// HTTP GET isteği (Cihaz ID'leri)
app.get('/api/deviceIds', async (req, res) => {
    try {
        // MongoDB'den tüm cihaz ID'lerini çekme ve sıralama
        const deviceIds = await fetchDeviceIdsFromDatabase();
        res.json(deviceIds);
    } catch (error) {
        console.error('Error fetching device IDs:', error);
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
            userId: data.userId, // Eklenen satır: Kullanıcı ID'sini kaydet
            gasIntensity: data.gasIntensity,
            location: {
                coordinates: [data.longitude, data.latitude],
            },
        });

        // Belgeyi veritabanına kaydedin
        const savedData = await newData.save();
        console.log('Veri MongoDB Time Series Database\'e kaydedildi:', savedData);

        // İstemcilere bildirim gönder
        io.emit('dataUpdate', savedData);
    } catch (error) {
        console.error('Veri kaydetme hatası:', error);
    }
}

// MongoDB'den son veriyi çekme
async function fetchLatestDataFromDatabase(deviceId) {
    // Veritabanından son veri çekme işlemleri burada gerçekleştirilir
    // Örnek olarak, bir Mongoose modeli kullanabilirsiniz
    const currentTime = new Date();
    const thirtySecondsAgo = new Date(currentTime.getTime() - 30 * 1000);

    // Belirli cihaz ID'sine ve son 30 saniyeye ait verileri veritabanından çekme işlemleri burada gerçekleştirilir
    const data = await TimeSeriesData.find({
        deviceId,
        timestamp: { $gte: thirtySecondsAgo, $lte: currentTime },
    }).sort({ timestamp: 1 });

    return data.length > 0 ? data[data.length - 1].toObject() : null;
}

// MongoDB'den tüm cihaz ID'lerini çekme
async function fetchDeviceIdsFromDatabase() {
    // Veritabanından tüm cihaz ID'lerini çekme işlemleri burada gerçekleştirilir
    // Örnek olarak, bir Mongoose modeli kullanabilirsiniz
    const distinctDeviceIds = await TimeSeriesData.distinct('deviceId');
    return distinctDeviceIds;
}

// HTTP sunucusunu başlatma
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
