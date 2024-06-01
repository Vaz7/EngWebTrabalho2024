const mongoose = require("mongoose");

var camposSchema = new mongoose.Schema({
    _id: Number,
    Nome: String,
    NomeFixed: String,
    Prioridade: Boolean,
}, { versionKey: false });

module.exports = mongoose.model('campo', camposSchema);