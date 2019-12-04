require('./config/config');
require('./models/db');
require('./config/passportConfig');

const express = require('express');
const expressSession = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const morgan = require('morgan');
var cookieParser = require('cookie-parser')
var http = require('http');
var https = require('https');
var fs = require('fs');

const rtsIndex = require('./routes/index.router');
const userIndex = require('./routes/user');
const PORT = process.env.PORT || 5000;

var key = fs.readFileSync(__dirname + '/selfsigned.key');
var cert = fs.readFileSync(__dirname + '/selfsigned.crt');
var options = {
  key: key,
  cert: cert
};

var app = express();

// middleware
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession({
    secret: 'cookie_secret',
      name: 'cookie_name',
      proxy: false,
      resave: true,
      expires: false,
      saveUninitialized: true
  }));

app.use(cors());
app.use(passport.initialize());

app.use(passport.session());
app.use('/api', rtsIndex);
app.use('/user', userIndex);

// Make Images "Uploads" Folder Publicly Available
app.use('/uploads', express.static('uploads'));
app.use(function(req, res, next){
    res.locals.user = req.user;
    next();
  });
  app.get('*', function(req, res,next){
    res.locals.user = req.user || null;
    next();
})

app.use((req, res, next) => {req.user = req.session.user; next()})
// error handler
app.use((err, req, res, next) => {
    if (err.name === 'ValidationError') {
        var valErrors = [];
        Object.keys(err.errors).forEach(key => valErrors.push(err.errors[key].message));
        res.status(422).send(valErrors)
    }

});

var server = https.createServer(options, app);

// start server
server.listen(PORT, () => console.log(`Server started at port : ${PORT}`));
