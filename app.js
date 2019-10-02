var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var fbStrategy = require('passport-facebook').Strategy;
var webpush = require('web-push');
var cors = require('cors');
var axios = require('axios');
var fs = require('fs');
var jwt = require('jsonwebtoken');

var groupRouter = require('./routes/group');
var authRouter = require('./routes/auth');
var indexRouter = require('./routes/index');
var requestsRouter = require('./routes/requests');
var userRouter = require('./routes/user');

var config = require('./config');
var models = require('./models/index').models;


var app = express();

passport.serializeUser((user, done) => {
  done(null, user.fb_id);
});

passport.deserializeUser((fb_id, done) => {
  models.User.findOne({fb_id: fb_id}, (err, user) => {
    if (err)
      done(err);
    done(null, user);
  });
});

passport.use(new fbStrategy({
  clientID: process.env.appId || config.appId,
  clientSecret: process.env.appSecret || config.appSecret,
  callbackURL: process.env.API_BASE_URL || config.callbackUrl,
  profileURL: config.profileURL,
  profileFields: config.profileFields,
}, (token, refreshToken, profile, done) => {
  models.User.findOne({fb_id: profile.id}).exec((err, user) => {
    if (err) {
      console.log("Error searching for user");
      return done(err);
    }
    
    if (!user) {
      // create and save the user model
      var newUser = models.User({
        name: profile.name.givenName + " " + profile.name.familyName,
        fb_id: profile.id,
        token: token,
        profile: profile.profileUrl,
      });
      newUser.save((err, object) => {
        if (err) {
          console.log("Error creating new user");
          return done(err);
        }
        console.log("Successfully created new user");
        return done(null, object);
      });
    }
    else {
      console.log("User found. Returning the user");
      return done(null, user);
    }
  });
}));

webpush.setVapidDetails(
  'mailto:aribalam64@gmail.com',
  process.env.publicKey || config.publicKey,
  process.env.privateKey || config.privateKey
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({secret: 'app-secret', resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

// Setting static media directory and including service worker option
const options = {
  setHeaders: (res, path, stat) => {
    res.set('Service-Worker-Allowed', '/');
  },
};

app.use('/api/auth', authRouter);

// Middleware to decode jwt token received and attach it to the request
app.use((req, res, next) => {

  var token = req.headers['authorization'];

  if (token !== 'null') {
    jwt.verify(token, process.env.jwtSecret || 'thisismysecret', (err, userData) => {
      if (err) {
        console.log(err);
        res.sendStatus(403);
      }
      else {
        req.user = userData;
        next();
      }
    });
  }
  else 
    res.sendStatus(403);
  
});

app.use('/api/group', groupRouter);
app.use('/api/user', userRouter);
app.use('/api/request', requestsRouter);
app.use('/api', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log(err.message);
  // render the error page
  res.status(err.status || 500).send(err);
});

module.exports = app;
