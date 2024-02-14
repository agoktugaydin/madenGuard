const jwt = require('jsonwebtoken');

function isTokenValid(token) {
    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        console.error('Error verifying token:', error);
        throw new Error('Invalid token');
    }
}

function extractUserId(token) {
    try {
        // Verify the token using the secret key to get the decoded payload
        const decoded =  jwt.verify(token, process.env.JWT_SECRET);
        // Extract and return the user ID from the decoded payload
        return decoded.userId;
    } catch (error) {
        console.error('Error extracting user ID from token:', error);
        return null;
    }
}

module.exports = {
    isTokenValid,
    extractUserId,
};