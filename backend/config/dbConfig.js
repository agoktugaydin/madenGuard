const mongoose = require('mongoose');

function connectToMongoDB() {
    mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection;
    
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.once('open', () => {
        console.log('Connected to MongoDB');
    });
}

module.exports = {
    connectToMongoDB,
};
