const mongoose = require('mongoose')
var passportLocalMongoose = require('passport-local-mongoose');

var favoritoSchema = new mongoose.Schema({
    _id: String,
    comment: String
  }, { _id: false });
  
  var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    name: String,
    level: String,
    dateCreated: String,
    lastAccess: String,
    facebookID: String,
    googleID: String,
    favoritos: [favoritoSchema]
  }, { versionKey: false });

userSchema.plugin(passportLocalMongoose, {usernameField: 'email'});

userSchema.plugin(passportLocalMongoose, {
    usernameField: 'email',
    errorMessages: {
        UserExistsError: 'A user with the given email is already registered'
    }
});

const User = mongoose.model('user', userSchema);
module.exports = User;