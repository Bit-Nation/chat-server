const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

mongoose.connect(process.env.MONGO_URL);

module.exports = {
    Message: mongoose.model('Message', new Schema({
        from: {
            type: String,
            required: true
        },
        msg: {
            type: String,
            required: true
        },
        room: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            required: true
        }
    }))
};