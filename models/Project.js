const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, default: 'Buffer' },
    startDate: { type: String },
    city: { type: String, required: true },
    departments: { type: [String], default: [] } // Array to hold departments
});

module.exports = mongoose.model('Project', ProjectSchema);
