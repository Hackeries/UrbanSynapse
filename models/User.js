const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    FirstName: String,
    LastName: String,
    EmailId: { type: String, unique: true },
    ContactNumber: String,
    Department: String,
    City: String,
    Password: String
});

module.exports = mongoose.model('User', UserSchema);
