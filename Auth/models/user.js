const mongoose = require('mongoose')
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    name: String,
    level: String,
    dateCreated: String,
    lastAccess: String
}, { versionKey: false });

userSchema.plugin(passportLocalMongoose, {usernameField: 'email'});

const User = mongoose.model('user', userSchema);
module.exports = User;