const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
    username: String,
    email: String,
    password: String,
    googleId: String,
    token: String,
});

mongoose.model('Users', UserSchema);