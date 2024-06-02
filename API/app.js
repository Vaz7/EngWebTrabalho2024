var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');

var acordaosRouter = require('./routes/acordaos');
var tribunaisRouter = require('./routes/tribunais');
var camposRouter = require('./routes/campos');

var mongoose = require("mongoose");

var mongoDB = process.env.MONGODB_URL || 'mongodb://127.0.0.1/acordaos';
mongoose.connect(mongoDB);
var db = mongoose.connection;
db.on("error", console.error.bind(console, "Erro de conexão ao MongoDB"));
db.once("open", () => {
  console.log("Conexão ao MongoDB realizada com sucesso");
});

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/acordaos', acordaosRouter);
app.use('/tribunais', tribunaisRouter);
app.use('/campos', camposRouter);

module.exports = app;
