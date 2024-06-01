const mongoose = require("mongoose");

var tribunalSchema = new mongoose.Schema({
    _id: String,
    name: String,
}, { versionKey: false });

module.exports = mongoose.model('tribunai', tribunalSchema);