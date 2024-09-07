const mongoose = require('mongoose');

const DiscussionSchema = new mongoose.Schema({
    topic: { type: String, required: true },
    messages: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, text: { type: String } }],
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Discussion', DiscussionSchema);
