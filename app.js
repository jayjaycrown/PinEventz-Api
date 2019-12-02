require('./config/config');
require('./models/db');
require('./config/passportConfig');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const morgan = require('morgan');

const rtsIndex = require('./routes/index.router');
const userIndex = require('./routes/user');
const PORT = process.env.PORT || 5000

var app = express();

// middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());
app.use(passport.initialize());
app.use('/api', rtsIndex);
app.use('/user', userIndex);


// error handler
app.use((err, req, res, next) => {
    if (err.name === 'ValidationError') {
        var valErrors = [];
        Object.keys(err.errors).forEach(key => valErrors.push(err.errors[key].message));
        res.status(422).send(valErrors)
    }

});

// start server
app.listen(PORT, () => console.log(`Server started at port : ${PORT}`));