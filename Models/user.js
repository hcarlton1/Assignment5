//exports and returns the values declared above
//database userSchema
var mongoose = require('mongoose')
, Schema = mongoose.Schema
, ObjectId = Schema.ObjectId;


var userSchema = new mongoose.Schema({
    firstName: {type: String, default: 'firstName'},
    lastName: {type: String, default: 'lastName'},
    email: {type: String,  required: true, default: 'email'},
    password:{type: Number,  required: true, default: '1234'},
  });


module.exports = mongoose.model('User', userSchema,'Users');



// var fullUserSchema = mongoose.Schema({
//   UserID: Number,
//   firstName: String,
//   lastName: String,
//   email: String,
//   password: Number,
//   address1: String,
//   address2: String,
//   city: String,
//   state: String,
//   zipcode: Number,
//   country: String
//
// });
// module.exports = mongoose.model('theUser', userSchema, "user");
// module.exports = mongoose.model('user2', fullUserSchema, "user");
// module.exports = User;
