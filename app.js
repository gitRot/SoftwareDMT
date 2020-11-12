// Using express framework
// Using pug, HTML templating


var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var session = require("express-session");
//session management library for cookies
var okta = require("@okta/okta-sdk-nodejs");
var ExpressOIDC = require("@okta/oidc-middleware").ExpressOIDC;
// Using oidc-middleware, simple authenticating with OpenID Connect
  //(using authentication server Okta)

//set route variables
//logged in dashboard
const dashboardRouter = require("./routes/dashboard");
//logged out public       
const publicRouter = require("./routes/public");
//request log out
const usersRouter = require("./routes/users");

var app = express();
//create okta object to retrieve user data
var oktaClient = new okta.Client({
  orgUrl: 'https://dev-2533364.okta.com',
  token: '00mGhEyj-Fa3GsM5wXKTJCN_Tyg0O3IBjcxFceTCTQ'
});
//create oidc object to handle login/registration and cookies
const oidc = new ExpressOIDC({
  issuer: "https://dev-2533364.okta.com/oauth2/default",
  client_id: '0oank0ytkIav1QVg45d5',
  client_secret: '2cjR4WS8FyiJdqovlmEiEg5aqB4lGF4AKhybnpjm',
  redirect_uri: 'http://localhost:3000/users/callback',
  scope: "openid profile",
  routes: {
    login: {
      path: "/users/login"
    },
    callback: {
      path: "/users/callback",
      defaultRedirect: "/dashboard"
    }
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'arigafhvbabvafkljweoidjvahvakfn', //random long string
  resave: true,
  saveUninitialized: false
}));
//tell express to enable oidc routes
app.use(oidc.router);
//retreive user profile on every user request
app.use((req, res, next) => {
  if (!req.userinfo) {
    return next();
  }
  oktaClient.getUser(req.userinfo.sub)
    .then(user => {
      req.user = user;
      res.locals.user = user;
      next();
    }).catch(err => {
      next(err);
    });
});

//enable login-only routes
function loginRequired(req, res, next) {
  if (!req.user) { //not logged in
    return res.status(401).render("unauthenticated");
  }

  next(); //logged in
}

//set routes
app.use('/', publicRouter);
app.use('/dashboard', loginRequired, dashboardRouter); //runs loginRequired() before processing dashboardRouter
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
