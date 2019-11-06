var express = require('express');
var createError = require('http-errors');
var app = express();
var path = require ('path');
var cookieParser = require('cookie-parser');

var catalogController = require('./Routes/catalogController.js');
var profileController = require('./Routes/profileController.js');

app.set('views', path.join(__dirname, './Views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use('/assets', express.static('./assets'));

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: false});
app.use(bodyParser.urlencoded({extended: true}));

var session = require('express-session');
var cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(session({secret: "nbad sessin secret"}));

// routes and controllers
app.use('/', catalogController);
app.use('/', profileController);



// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });
//
// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });



app.listen(2020);
console.log('2020 is the magic port');
