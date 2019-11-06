var express = require('express');
var router = express.Router();
const {check, validationResult} = require('express-validator/check');


//Controller Logic to handle user specic functionality
//var express = require('express');
//var app = module.exports = express();
let UserDB = require('../util/userDB');
let UserItemDB = require('../util/UserItemDB');
let ItemDB = require('../util/itemDB');
let UserProfile = require('../Models/userProfile');
let UserItemObj = require('../Models/UserItemObj');
//session handling
var session = require('express-session');
var cookieParser = require('cookie-parser');

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/assignment4', {
  useNewUrlParser: true
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function() {
  console.log('connection succesful');
});
//define the schema - this can take place of the model
// var itemRating = new mongoose.Schema({
//   user: String,
//   item: Number,
//   Rating: String,
//   Madeit: String
// });

// var userItemDbModel = mongoose.model('UserItem', itemRating, 'Feedback');


router.use(cookieParser());
router.use(session({
  secret: "nbad session secret"
}));
//const wrap = require("../util/wrap");

router.all('/profile', async (request, response, next) => {
  console.log("profile all request");
  //check if session tracking has started:
  let sessionProfile = request.session.currentProfile;
  // console.log(sessionProfile);

  let action = request.query.action;
  console.log("user profile action " + action);

  if (typeof sessionProfile != 'undefined') { //session data exists. Use that.
    //console.log("session profile " + sessionProfile);

    //add user to view
    response.locals.theUser = request.session.theUser;

  }
  // else { //session tracking not started. Use hard-coded data
  //   //set default user object using hardcoded data from DB
  //
  //
  //   //get a user as if they logged in
  //   let theUser = await UserDB.getUser("hcarlton@uncc.edu");
  //   request.session.theUser = theUser;
  //   console.log("user added to sesion " + theUser);
  //   //add user to view data
  //   response.locals.theUser = request.session.theUser;
  //
  //   action = "showProfile";
  //   let userProfile = new UserProfile();
  //   let userItems = await UserItemDB.selectUserItems("hcarlton@uncc.edu");
  //   let userItemsArr = [];
  //
  //   if (userItems.length >= 1) {
  //     userItemsArr = await makeProfileItemsForView(userItems);
  //     userProfile.setItems(userItemsArr);
  //     request.session.currentProfile = userProfile.getItems();
  //   }
  // }
  next();
});

router.get('/profile', async (request, response) => {
  console.log("profile get request");
  //check if session tracking has started:
  let sessionProfile = request.session.currentProfile;
  let failed = request.query.failed;
  let action = request.query.action;
  console.log("user profile GET action " + action);
  console.log("failed: " +failed);
  // if (typeof sessionProfile == 'undefined') {
    //session tracking not started. Use hard-coded data
    //set default user object using hardcoded data from DB

    //get a user as if they logged in
  //   let theUser = UserDB.getUser("hcarlton@uncc.edu");
  //   request.session.theUser = theUser;
  //   console.log("user added to sesion " + theUser);
  //
  //   action = "showProfile";
  //   let userProfile = new UserProfile();
  //   let userItems = await UserItemDB.selectUserItems("hcarlton@uncc.edu");
  //   if (userItems.length >= 1) {
  //     // viewURL = "/profile";
  //     userProfile.setItems(userItems);
  //     request.session.currentProfile = userProfile;
  //   }
  //   console.log(userProfile);
  // }


  // console.log("updated session properties: " + JSON.stringify(request.session));
  if (action == null || action == "" || action == "showProfile") {
    respData = await showProfile(request, response);
    return response.render(respData.view, {data: respData.data});
  } else if (action == "signout") {
    //save user profile to db
    console.log("signout");
    request.session.destroy();
    //remove user from locals
    delete response.locals.theUser;
    return response.render('index');
  }else if (action == "signIn"){
    console.log("SIGNIN");
    if (failed == "true"){
      console.log("failed to login");
      return response.render('login', {failed: true});
    }else{
      console.log("normal login page");
      return response.render('login', {failed: false});
    }
  }


  //before forwarding to view, check if profile is empty
  let userProfile = request.session.currentProfile;
  if (userProfile == null || userProfile.length == 0) {
    request.emptyProfile = "Your profile is empty";
  }
  response.locals.theUser = request.session.theUser;

  return response.render('myItems', {
    data: request.session.currentProfile
  });
});

//post profile requests with action parameter
router.post('/profile', [check('email').isEmail(), check('password').isLength({min:4})], async function(request, response ){
  let action = request.body.action;
  const errors = validationResult(request);
  console.log("user profile function requested " + action);



  if (action == null || action == "" || action == "showProfile") {
    respData = showProfile(request, response);
  } else if (action == "update") {
    respData = await updateProfile(request, response);
  } else if (action == "save") {
    respData = await updateProfileSave(request, response);
  } else if (action == "rate") {
    respData = await updateProfileRating(request, response);
  } else if (action == "madeIt") {
    respData = await updateProfileMadeIt(request, response);
  } else if (action == "delete") {
    respData = await updateProfileDelete(request, response);
  } else if (action == "signout") {
    //save user profile to db
    console.log("signout");
    request.session.destroy();
    delete response.locals.theUser;
    respData = {};

  }else if (action == "signIn"){ //action request for signin
    email = request.body.email;
    password = request.body.password;

    if(!errors.isEmpty()){
      return response.status(422).json({errors: errors.array()});
    }

    let user  = await UserDB.getUser(email);
    if( user == null || user.password != password){
      console.log("login failed");
      response.redirect('/profile?action=signin');
    }else{
      console.log("login success: " + user);
      let theUser = user;
      request.session.theUser = theUser;
      console.log("user added to session " + theUser);

      response.locals.theUser = request.session.theUser;
      action = "showProfile";
      let userProfile = new UserProfile();
      let userItems = await UserItemDB.selectUserItems(email);
      let userItemsArr = [];
      if (userItems.length >= 1){
        userItemsArr = await makeProfileItemsForView(userItems);
        userProfile.setItems(userItemsArr);
        request.session.currentProfile = userProfile.getItems();
      }
      respData = await showProfile(request, response);
      response.render(respData.view, {data: respData.data});
    }
  }
  //before forwarding to view, check if cart is empty after updates
  let userProfile = request.session.currentProfile;
  if (userProfile == null || userProfile.length == 0) {
    request.emptyProfile = "Your profile is empty.";
  }else {
  response.render(respData.view, {data: respData.data});
}
});



let showProfile = function(request, response) {

  let userProfile = request.session.currentProfile;
  if (userProfile == null || userProfile == 0) {
    request.emptyProfile = "Your profile is empty";
  } else {
    request.session.currentProfile = userProfile;
  }
  viewAddress = 'myItems';
  // Get item object from items list
  viewData = userProfile;
  // Set viewData to this item object

  //return data and how to display it
  profile = {
    view: viewAddress,
    data: viewData
  };
  return profile;
};

let updateProfile = function(request, response) {
  console.log("update profile function");
  let viewAddress = "";
  //get all item codes on view
  let viewItems = request.body.itemList;
  let itemCodeParam = request.body.itemCode;

  //validate itemCodeParam
  if (itemCodeParam != null || !itemCodeParam == "") {
    //get profile from session

    let userProfile = request.session.currentProfile;
    //validate item requested for update is in itemList
    if (isItemInView(viewItems, itemCodeParam)) {
      console.log("item in view");
      //get item from profile. If not in profile redisplay profile view
      userItem = isItemInProfile(userProfile, itemCodeParam);

      if (userItem != null) {
        console.log("item in profile");
        request.thisUserItem = userItem;
        //return "/profile/feedback";

        viewAddress = "feedback";
        // Get item object from items list
        viewData = userItem;
        console.log("view Data :" + JSON.stringify(viewData));
        // Set viewData to this item object

        //return data and how to display it
        profile = {
          view: viewAddress,
          data: viewData
        };
        return profile;

      }
    }
  }
  return null;
}

let isItemInProfile = function(userProfile, itemCodeParam) {
  //console.log(userProfile)
  let itemCode = 0;
  let userItems = userProfile
  for (let i = 0; i < userItems.length; i++) {
    itemCode = userItems[i].item.code;
    if (itemCode == itemCodeParam) {
      return userItems[i];
    }
  }
  return false;
};

let updateProfileSave = async function(request, response) {
  let userProfile = request.session.currentProfile;

  //get all item codes on view
  let viewItems = request.body.itemList;
  let itemCodeParam = request.body.itemCode;

  if ((isItemInView(viewItems, itemCodeParam)) && (!isItemInProfile(userProfile, itemCodeParam))) {
    if (typeof itemCodeParam != 'undefined') {
      let userProfileObj = new UserProfile();

      await userProfileObj.addItem(request.session.theUser.email, itemCodeParam);

      let userItems = userProfileObj.getItems();
      let userItemsArr = await makeProfileItemsForView(userItems);

      userProfileObj.setItems(userItemsArr);
      request.session.currentProfile = userProfileObj.getItems();

    } else {
      response.locals.errorMessage = "problem with item rating feedback request. Try again.";
    }
  } else {
    response.locals.errorMessage = "problem with item rating feedback request. Try again.";
  }
  viewData = request.session.currentProfile;
  //Set viewData to this item object

  //return data and how to display it
  profile = {
    view: "myItems",
    data: viewData
  };

  return profile;
}

let updateProfileRating = async function(request, response) {
  let userProfile = request.session.currentProfile;

  //get all item codes on view
  let viewItems = request.body.itemList;
  let itemCodeParam = request.body.itemCode;

  if ((isItemInView(viewItems, itemCodeParam)) && (isItemInProfile(userProfile, itemCodeParam))) {
    let ratingParam = request.body.rating;
    if (typeof ratingParam != 'undefined') {
      if (ratingParam == "No") {
        ratingParam = 0;
      } else if (ratingParam == "Yes") {
        ratingParam = 1;
      }
      let userProfileObj = new UserProfile();
      userProfileObj.setItems(userProfile);
      let userItem = isItemInProfile(userProfile, itemCodeParam);
      if (userItem) {
        userItem.rating = ratingParam;
        await userProfileObj.updateItemRating(userItem, request.session.theUser.email);
        request.session.currentProfile = userProfileObj.getItems();
      } else {
        response.locals.errorMessage = "problem with item rating feedback request. Try again.";
      }
    } else {
      response.locals.errorMessage = "problem with item rating feedback request. Try again.";
    }
  } else {
    response.locals.errorMessage = "problem with item rating feedback request. Try again.";
  }
  viewData = request.session.currentProfile;
  //Set viewData to this item object

  //return data and how to display it
  profile = {
    view: "myItems",
    data: viewData
  };
  console.log(profile);

  return profile;
}

let updateProfileMadeIt = async function(request, response) {
  let userProfile = request.session.currentProfile;

  //get all item codes on view
  let viewItems = request.body.itemList;
  let itemCodeParam = request.body.itemCode;

  if ((isItemInView(viewItems, itemCodeParam)) && (isItemInProfile(userProfile, itemCodeParam))) {
    let madeItParam = request.body.madeIt;
    if (typeof madeItParam != 'undefined') {
      if (madeItParam == "No") {
        madeItParam = 0;
      } else if (madeItParam == "Yes") {
        madeItParam = 1;
      }
      let userProfileObj = new UserProfile();
      userProfileObj.setItems(userProfile);
      let userItem = isItemInProfile(userProfile, itemCodeParam);
      userItem.madeIt = madeItParam;
      await userProfileObj.updateItemFlag(userItem, request.session.theUser.email);
      request.session.currentProfile = userProfileObj.getItems();
    } else {
      response.locals.errorMessage = "problem with item rating feedback request. Try again.";
    }
  } else {
    response.locals.errorMessage = "problem with item rating feedback request. Try again.";
  }
  viewData = request.session.currentProfile;
  //Set viewData to this item object

  //return data and how to display it
  profile = {
    view: "myItems",
    data: viewData
  };
  console.log(profile);

  return profile;
}

let isItemInView = function(viewItems, itemCode) {
  //check if item in profile

  if (typeof viewItems == 'object') {
    for (let i = 0; i < viewItems.length; i++) {

      if (viewItems[i] == itemCode) {
        //item is in profile
        return true;
      }
    }
  } else if (typeof viewItems == 'string') {
    if (viewItems == itemCode) {
      //item is in profile
      return true;
    }
  }
  //item is not in profile
  return false;
}

let updateProfileDelete = function(request, response) {
  console.log("in updateProfileDelete function");
  let userProfile = request.session.currentProfile;
  //get all item codes on view
  let viewItems = request.body.itemList;
  let itemCodeParam = request.body.itemCode;

  if ((isItemInView(viewItems, itemCodeParam)) && (isItemInProfile(userProfile, itemCodeParam))) {

    let userProfileObj = new UserProfile();
    userProfileObj.setItems(userProfile);
    let userItem = isItemInProfile(userProfile, itemCodeParam);
    if (userItem != null) {
      console.log("remove item");
      //console.log(userProfile);
      userProfileObj.removeItem(request.session.theUser.email, itemCodeParam);
      request.session.currentProfile = userProfileObj.getItems();
    }
  } else {
    response.locals.data.errorMessage = "problem with item rating feedback request. Try again.";
  }

  viewData = request.session.currentProfile;

  //Set viewData to this item object
  //return data and how to display it
  profile = {
    view: "myItems",
    data: viewData
  };
  return profile;
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
async function makeProfileItemsForView(userItems) {
  let userItemsArr = [];

  await asyncForEach(userItems, async (element) => {
    userItem = new UserItemObj();
    item = await ItemDB.getItem(element.item);
    userItem.setItem(item);
    userItem.setRating(element.rating);
    userItem.setMadeIt(element.madeIt);
    userItemsArr.push(userItem);
  });
  return userItemsArr;
}

module.exports = router;
