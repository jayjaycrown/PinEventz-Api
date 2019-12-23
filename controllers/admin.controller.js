const mongoose = require('mongoose');
const passport = require('passport');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Board = require('../models/board');
const Event = require('../models/event');
const Comment = require('../models/comment');
const Pinned = require('../models/pinnedEvent')
const hbs = require('nodemailer-express-handlebars');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const passwordResetToken = require('../models/resettoken');
const Ticket = require('../models/ticket');



// Admin section to handle user / organizer of event
module.exports.getAllUsers = (req, res, next) => {
    User.find()
      .then(result => {
        return res.status(200).json(result);
      })
      .catch(err => {
        res.status(500).json(err);
      })
}
// Admin  Section to get single user by id
module.exports.getSingleUser = (req, res, next) => {
    const id = req.params.Id;
    User.findById(id)
      .exec()
      .then(doc => {
        if (doc) {
          res.status(200).json(doc);
        } else {
          res.status(404).json({
            message: 'Invalid Id Number'
          });
        }
      })
      .catch(err => {
        res.status(500).json({
          error: err
        });
      });
}
// Admin Section to delete user
module.exports.deleteSingleUser = (req,res, next) => {
    const id = req.params.Id;
    User.findByIdAndDelete(id)
      .exec()
      .then(doc => {
        if (doc) {
          res.status(200).json({
            message: "User Deleted successfully"
          });
        } else {
          res.status(200).json({
            message: 'Invalid Id Number'
          });
        }
      })
      .catch(err => {
        res.status(500).json({
          error: err
        });
      });
}