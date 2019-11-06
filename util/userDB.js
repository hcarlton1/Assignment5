//April 2 update
const User = require('../Models/user');

module.exports.getUsers = function () {
    return new Promise((resolve, reject) => {
        User.find().then(data => {
            resolve(data);
        }).catch(err => {
            return reject(err);
        })
    })
}//end findAll by category

module.exports.getUser = function (userEmail) {
    return new Promise((resolve, reject) => {
        User.findOne({
            email: userEmail
        }).exec().then(data => {
            console.log("here +"+userEmail);
            resolve(data);
        }).catch(err => {
            return reject(err);
        })
    })
}//end find item


// module.exports.getAllUsers = getAllUsers;
// module.exports.getUser = getUser;
