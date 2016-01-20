var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./db');
var md5 = require('md5');
require('dotenv').load();

// Passport local strategy config
passport.use(new Strategy(
            function(username, password, cb) {
                db.users.findByUsername(username, function(err, user) {
                    if (err) { return cb(err); }
                    if (!user) { return cb(null, false); }
                    if (user.password != md5(password)) { return cb(null, false); }
                    return cb(null, user);
                });
            }));

// Passport serialization
passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});
passport.deserializeUser(function(id, cb) {
    db.users.findById(id, function (err, user) {
        if (err) { return cb(err); }
        cb(null, user);
    });
});

// Create Express app and set views
var app = express();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'process.env.SESSION_SECRET', resave: false, saveUninitialized: false, cookie: { maxAge: 3600000 } }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/',
        require('connect-ensure-login').ensureLoggedIn(),
        function(req, res){
    res.render('pad');
});

app.get('/login',
        function(req, res) {
            res.render('login');
});

app.post('/login',
        passport.authenticate('local', { failureRedirect: '/login' }),
        function(req, res) {
            res.redirect('/');
});

app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/login');
});

app.get('/(:id)',
        require('connect-ensure-login').ensureLoggedIn(),
        function(req, res) {
            res.render('pad');
});

// sharejs
var sharejs = require('share');
require('redis');

var options = {
    db: {
        type: 'redis',
        port: process.env.REDIS_PORT 
    },
};

sharejs.server.attach(app, options);

var port = process.env.PORT;
app.listen(port);
