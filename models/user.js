const mongoose = require('mongoose')
const Schema = mongoose.Schema

const User = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    confirmPassword: {
        type: String,
        required: true
    },
    profilePic: String,
    resetToken: String,
    resetTokenExpiration: Date 
}) 


module.exports = mongoose.model('User', User)