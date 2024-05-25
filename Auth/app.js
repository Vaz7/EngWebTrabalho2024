var express = require('express');
var path = require('path');
var logger = require('morgan');
var mongoose = require('mongoose')
var session = require('express-session'); // Import express-session

var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy

var mongoDB = 'mongodb://127.0.0.1/acordaos'

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



var usersRouter = require('./routes/users');

var app = express();

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
