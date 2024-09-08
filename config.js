require('dotenv').config(); // Load environment variables from .env file

module.exports = {
    mongoURI: process.env.MONGO_URI,
    sessionSecret: process.env.SESSION_SECRET,
};
