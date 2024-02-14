const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, "Please provide a user id."],
        unique: [true, "User id must be unique."],
      },
    name: String,
    surname: String,
    role: String,
    email: {
        type: String,
        required: [true, "Please provide an email."],
        unique: [true, "Email must be unique."],
      },
      password: String
    //password: {iv: String, encryptedData: String}
});

// Check if the model already exists to avoid redefining it
const UserData = mongoose.models.UserData || mongoose.model('UserData', userSchema);

module.exports = UserData;
