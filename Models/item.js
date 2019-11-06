var mongoose = require('mongoose')
, Schema = mongoose.Schema
, ObjectId = Schema.ObjectId;

var itemSchema = new mongoose.Schema({
    code: {type: Number, default: '1'},
    name: {type: String, default: 'itemName'},
    description: {type: String, default: 'itemDescription'},
    category: {type: String, default: 'itemCategory'},
  });

module.exports = mongoose.model('Item', itemSchema,'Items');
