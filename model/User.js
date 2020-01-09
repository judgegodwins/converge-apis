const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
var uniqueArrayPlugin = require('mongoose-unique-array');

const MessageSchema = new Schema({
    _id: false,
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['sent', 'received']
    }
})

var friendSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    friends_status: Boolean,

    messages: [MessageSchema]
})




var userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female']
    },
    friends: [friendSchema],
})

userSchema.plugin(uniqueArrayPlugin);

module.exports = mongoose.model('User', userSchema);