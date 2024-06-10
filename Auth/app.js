var express = require('express');
var path = require('path');
var logger = require('morgan');
var mongoose = require('mongoose')
var session = require('express-session'); // Import express-session
const cors = require('cors');


var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var FacebookStrategy = require("passport-facebook");
require("dotenv").config();
var GoogleStrategy = require("passport-google-oauth20").Strategy;


var mongoDB = process.env.MONGODB_URL || 'mongodb://127.0.0.1/acordaos';

mongoose.connect(mongoDB)
var db = mongoose.connection
db.on('error',console.error.bind(console,'Erro de conexão ao MongoDB'))
db.once('open',()=>{
  console.log("Conexão ao MongoDB realizada com sucesso.")
})



// passport config
var User = require('./models/user');
passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:8888/login/facebook/callback",
      profileFields: ['id', 'displayName', 'emails', 'name']
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        //console.log(profile);
        
        let user = await User.findOne({ facebookID: profile.id });

        if (user) {
          return cb(null, user);
        } else {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
          const name = profile.name.givenName || profile.displayName || "";

          const newUser = new User({
            username: profile.id,
            name: name,
            email: email,
            level: "normal",
            dateCreated: new Date().toISOString().substring(0, 10),
            lastAccess: "",
            facebookID: profile.id,
          });

          try {
            const createdUser = await User.create(newUser);
            return cb(null, createdUser);
          } catch (registrationError) {
            console.error('Error creating new user:', registrationError);
            return cb(registrationError);
          }
        }
      } catch (error) {
        return cb(error);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8888/login/google/callback",
      profileFields: ['id', 'displayName', 'emails', 'name']
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        //console.log(profile);
        
        let user = await User.findOne({ googleID: profile.id });

        if (user) {
          return cb(null, user);
        } else {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
          const name = profile.name.givenName || profile.displayName || "";

          const newUser = new User({
            username: profile.id,
            name: name,
            email: email,
            level: "normal",
            dateCreated: new Date().toISOString().substring(0, 10),
            lastAccess: "",
            googleID: profile.id,
          });

          try {
            const createdUser = await User.create(newUser);
            return cb(null, createdUser);
          } catch (registrationError) {
            console.error('Error creating new user:', registrationError);
            return cb(registrationError);
          }
        }
      } catch (error) {
        return cb(error);
      }
    }
  )
);


var usersRouter = require('./routes/users');

var app = express();

app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'EngWeb2024', // Replace with a secure secret key
    resave: false,
    saveUninitialized: false
  }));


app.use(passport.initialize());
app.use(passport.session());

app.use('/users', usersRouter);

module.exports = app;
