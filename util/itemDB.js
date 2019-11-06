//April 2nd update
const Item = require('../Models/item');
const UserItems = require('../util/UserItemDB');

module.exports.getItems = function (category) {
    return new Promise((resolve, reject) => {
        Item.find({
            category: category
        }).then(data => {
            resolve(data);
        }).catch(err => {
            return reject(err);
        })
    })
}//end findAll by category

module.exports.getItem = function (itemCode) {
    return new Promise((resolve, reject) => {
        console.log("in itemDb " + itemCode);
        Item.findOne({
            code: itemCode
        }).exec().then(data => {
            resolve(data);
        }).catch(err => {
            return reject(err);
        })
    })
}//end find item
// module.exports.getCategories = async function (Category){
//   var categories = [];
//   var data = await getAllItems();
//   data.forEach(function(items){
//     if(!categories.includes(items.Category)){
//       categories.push(items.Category);
//     }
//   });
//   return categories;
//   console.log(getCategories);
// }

// module.exports.getAllItems = getAllItems;
// module.exports.getItem= getItem;
// module.exports.getCategories = getCategories;
// module.exports.category =  ["Landscape", "Sports"];
