var express = require('express');
var router = express.Router();

var ItemDB = require('../util/itemDB');
let UserItemDB = require('../util/UserItemDB');

var mongoose = require('mongoose');

//connect to database - if it does not exist it will be created
mongoose.connect('mongodb://localhost/assignment4', {
  useNewUrlParser: true
});

//create variable to hold the needed information for rendering



var itemArray;
/* GET home page. */
router.get("/*", async function(request, response, next) {
  // at the start of application load the catalog
  //TODO - still using hard ItemCode categories to keep format used in viewes.
  //this should be updated to use DB group by functionality rather than hardcoding categories.
  let Landscape = await ItemDB.getItems("Landscape");
  let Sports = await ItemDB.getItems("Sports");
  itemArray = [{
    categoryName: "Landscape",
    items: Landscape
  }, {
    categoryName: "Sports",
    items: Sports
  }];

  console.log("items list length: " + itemArray.length);

  //checking session
  console.log("checking for session data");
  let sessionProfile = request.session.currentProfile;

  if (typeof sessionProfile != 'undefined') { //session data exists. Use that.
    //console.log("session profile " + sessionProfile);
    //add user to view
    response.locals.theUser = request.session.theUser;
  }
  next();
});

router.get('/', function(request, response, next) {
  //render homepage view
  response.render("index");
});
router.get('/about', function(request, response, next) {
  //render homepage view
  response.render("about");
});
router.get('/contact', function(request, response, next) {
  //render homepage view
  response.render("contact");
});

router.get('/categories', async function(req, res) {
  //get items list from database

  // validate request to set view address and data
  var viewData = await catalogValidation(req, res);
  console.log("view data from catalogvalidation: " + viewData);
  console.log("items list: " + viewData.view);

  console.log("in categories: " + JSON.stringify(viewData.data));

  res.render(viewData.view, {
    data: viewData.data
  });
});

router.get('/categories/:categoryName', function(req, res) {
  var categoryName = req.params.categoryName;
  // this route displays catalog of items for one category

  // validate request to set view address and data
  var viewData = catalogValidation(req, res);

  res.render(viewData.address, viewData.data);
})
router.get('/categories/item/:itemCode', async function(req, res) {
  // this route displays item view

  // validate request to set view address and data
  var viewData = await catalogValidation(req, res);
  console.log("in GET an item: " + JSON.stringify(viewData.data));

  res.render(viewData.view, {
    data: viewData.data
  });
});
router.get('/categories*', function(req, res) {
  // handle anything else coming through to /categories
  // validate request to set view address and data
  var viewData = catalogValidation(req, res);
  viewAddress = 'catalog';
});

var catalogValidation = async function(req, res) {
  //create variables to hold the needed information for rendering
  var viewAddress = 'catalog';
  var viewData = itemArray;

  //Check If the catalog request parameter exists and validates (is not null and is not empty and is a valid category)
  if (req.params.categoryName != null && req.params.categoryName != "") {
    //Get the items of this category from the items list
    //Set viewAddress to catalog view
    viewAddress = 'catalog';
    //Set viewData to item list (narrowed down catalog)
    viewData = itemArray;
    //return data and how to display it
    catalog = {
      address: viewAddress,
      data: viewData
    };
    return catalog;

    //Check if the itemCode request parameter exists and validates (is not null and is not empty)
    //Check if the itemCode exists in the items list
  } else if (req.params.itemCode != null && req.params.itemCode != "") {
    //Set viewAddress to item view
    console.log("req.params.itemCode: " + req.params.itemCode);
    viewAddress = 'item';
    //Get item object from items list
    viewData = await ItemDB.getItem(req.params.itemCode);
    let itemRating = await UserItemDB.selectItemsForAvg(req.params.itemCode);
    let rating = await getAvg(itemRating);
    let ratingImg = "0-star-rating.png"; //default rating image
    if (rating >= 1 && rating < 2) {
      ratingImg = "1-star-rating.png";
    } else if (rating >= 2 && rating < 3) {
      ratingImg = "2-star-rating.png";
    } else if (rating >= 3 && rating < 4) {
      ratingImg = "3-star-rating.png";
    } else if (rating >= 4 && rating < 5) {
      ratingImg = "4-star-rating.png";
    } else if (rating >= 5) {
      ratingImg = "5-star-rating.png";
    }
    //Set viewData to this item object
    viewData.rating = ratingImg; //set rating image
    viewData.inProfile = isProfileItem(req);

    //return data and how to display it
    catalog = {
      view: viewAddress,
      data: viewData
    };

    return catalog;

  } else { // If the itemCode does not validate
    // Default - Categories view including the complete item catalog
    //return data and how to display it

    catalog = {
      view: viewAddress,
      data: itemArray
    };
    return catalog;
  }
};

async function getAvg(arr) { //TODO:can use db aggregate functions to replace this
  let total = 0;
  arr.forEach(function(el) {
    total = total + el.rating;
  })
  return total / arr.length;

};

function isProfileItem(req) {
  let userProfile = req.session.currentProfile;
  if (userProfile) {
    for (let i = 0; i < userProfile.length; i++) {
      itemCode = userProfile[i].item.code;
      if (itemCode == req.params.itemCode) {
        return true;
      }
    }
    return false;
  };
}
module.exports = router;
