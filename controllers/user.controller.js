const mongoose = require('mongoose');
const passport = require('passport');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
//const User = mongoose.model('User');
const Board = require('../models/board');
const Event = require('../models/event');
const Comment = require('../models/comment');
const Pinned = require('../models/pinnedEvent')
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const passwordResetToken = require('../models/resettoken');
const Ticket = require('../models/ticket');


const multer = require('multer');
// Multer File upload settings
const DIR = './uploads/';

// section to create board by authenticated user
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
    cb(null, true)
  } else {
    return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }


};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});


module.exports.register = (req, res, next) => {
  User.findOne({
      email: req.body.email
    })
    .exec()
    .then(user => {
      if (user) {
        return res.status(409).json({
          message: "Mail already exist"
        })
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(400)
              .json({
                message: 'Error hashing password'
              });
          }
          var user = new User({
            fullName: req.body.fullName,
            email: req.body.email,
            password: hash,
            cityCountry: req.body.cityCountry,
            //dateOfBirth:req.body.dateOfBirth,
            gender: req.body.gender,
            //checkbox:req.body.checkbox,
            created_dt: Date.now()
          });
          user.save((err, doc) => {
            if (!err) {
              res.send(doc);
            }
          });
        })
      }
    })
}


module.exports.authenticate = (req, res, next) => {
  // call for passport authentication
  passport.authenticate('local', (err, user, info) => {
    // error from passport middleware
    if (err) return res.status(400).json(err);
    // registered user
    else if (user) {
      const token = jwt.sign({
          email: user.email,
          userId: user._id,
          fullName: user.fullName
        },
        process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXP
        });
      return res.status(200).json({
        message: "Authentication Successful: hello: " + user.fullName,
        user: user,
        token: token,
        expiresIn: process.env.JWT_EXP

      })

    }
    // unknown user or wrong password
    else return res.status(404).json(info);
  })(req, res);
}

module.exports.userProfile = (req, res, next) => {
  User.findById(req.userData.userId, function (err, user) {
    if (!user) {
      res.status(200).json({
        message: 'User not found'
      });
    } else {
      res.status(200).json({
        user: user
      })
    }
  })

}

module.exports.editProfile = (req, res, next) => {

  User.findById(req.userData.userId, function (err, user) {
    if (!user) {
      return res.status(200).json({
        message: 'User not found'
      });
    }
    bcrypt.hash(req.body.password, 10, (err, hash) => {
      const url = req.protocol + '://' + req.get('host');
      var email = req.body.email.trim();
      var fullName = req.body.fullName.trim();
      var cityCountry = req.body.cityCountry.trim();
      var gender = req.body.gender.trim();
      var dateOfBirth = req.body.dateOfBirth.trim();
      var profileUrl = url + '/' + req.file.path;
      var password = hash;
      user.email = email;
      user.fullName = fullName;
      user.cityCountry = cityCountry;
      user.gender = gender;
      user.password = password;
      user.dateOfBirth = dateOfBirth;
      user.profileUrl = profileUrl;
      user.save(function (err) {
        if (err) {
          res.status(500).json({
            message: 'error occured: ' + err
          });
        }
        res.status(200).json({
          message: 'Edited Successfully'
        });
      });
    })
  })

}

module.exports.resetPassword = (req, res, next) => {
  if (!req.body.email) {
    return res
      .status(500)
      .json({
        message: 'Email is required'
      });
  }
  User.findOne({
    email: req.body.email
  }, function (err, user) {
    if (!user) {
      return res
        .status(409)
        .json({
          message: 'Email does not exist'
        });
    }
    // console.log("user found id is" + user._id);
    var resettoken = new passwordResetToken({
      _userId: user._id,
      resettoken: crypto.randomBytes(16).toString('hex')
    });
    resettoken.save(function (err) {
      if (err) {
        return res.status(500).send({
          message: err.message
        });
      }
      passwordResetToken.find({
        _userId: user._id,
        resettoken: {
          $ne: resettoken.resettoken
        }
      }).remove().exec();
      res.status(200).json({
        message: 'Reset Password link sent successfully.'
      });
      var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'pineventz19@gmail.com',
          pass: 'pinEventz001'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'pineventz19@gmail.com',
        subject: 'PinEventz Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'https://pin-eventz.herokuapp.com/response-reset-password/' + resettoken.resettoken + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      }
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          return res.status(500).json({
            message: err.message
          });
        }
        // console.log(err)
        else {
          return res.status(200).json({
            message: "sent Successfully"
          });
        }
        // console.log(info);
      })
    })
  })


}

module.exports.ValidPasswordToken = (req, res, next) => {
  if (!req.body.resettoken) {
    return res
      .status(500)
      .json({
        message: 'Token is required'
      });
  }
  passwordResetToken.findOne({
    resettoken: req.body.resettoken
  }, {
    useFindAndModify: false
  }, function (err, user) {
    if (!user) {
      return res
        .status(409)
        .json({
          message: 'Invalid URL'
        });
    }
    User.findById({
      _id: user._userId
    }).then(() => {
      res.status(200).json({
        message: 'Token verified successfully.'
      });
    }).catch((err) => {
      return res.status(500).json({
        message: err.message
      });
    });
  });


}

module.exports.NewPassword = (req, res, next) => {
  passwordResetToken.findOne({
    resettoken: req.body.resettoken
  }, function (err, userToken, next) {
    if (!userToken) {
      return res
        .status(409)
        .json({
          message: 'Token has expired'
        });
    }

    User.findOne({
      _id: userToken._userId
    }, function (err, userEmail, next) {
      if (!userEmail) {
        return res
          .status(409)
          .json({
            message: 'User does not exist'
          });
      }

      return bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
        if (err) {
          return res
            .status(400)
            .json({
              message: 'Error hashing password'
            });
        }
        userEmail.password = hash;
        userEmail.save(function (err) {
          if (err) {
            return res
              .status(400)
              .json({
                message: 'Password can not reset.'
              });
          } else {
            userToken.remove();
            return res
              .status(201)
              .json({
                message: 'Password reset successfully'
              });
          }

        });
      });
    });

  })
}


module.exports.logout = (req, res, next) => {
  req.logout();
  res.status(200).json({
    'message': 'successfully logout'
  });
}

module.exports.interest = (req, res, next) => {
  User.findOne({
    _id: req._id
  }, function (err, user) {
    if (!user) {
      return res.status(500).json("Oops" + err);
    } else {
      My_Interest.create({
        interest: req.body.interest
      }, function (err, inter) {
        if (err) {
          return res.status(501).json(err);
        } else {
          // section to add the user detail
          inter.chooser.id = req.user._id;
          inter.chooser.username = req.user.username;
          inter.save()
          user.selected_interest.push(inter);
          user.save()
          return res.status(200).json({
            //result:user,
            message: 'You have successfully select your area of interest'
          });
        }
      })
    }
  })
}

module.exports.users = (req, res, next) => {

  User.find()
    .select()
    .exec()
    .then(result => {
      return res.status(200).json(result);
    })
    .catch(err => {
      res.status(500).json(err);
    })
}


//get User by id
module.exports.singleUser = (req, res, next) => {
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

module.exports.createBoard = (req, res, next) => {
  user: req.userData;
  const url = req.protocol + '://' + req.get('host')
  //const url = 'https://' + req.get('host')
  //console.log(req.file);
  // const url = req.protocol + '://' + req.get('host')
  // boardUrl = url + '/uploads/' + req.file.filename;


  // console.log(req.file);
  const board = new Board({
    //_id: new mongoose.Types.ObjectId(),
    boardUrl: url + '/' + req.file.path,
    boardName: req.body.boardName,
    boardDescription: req.body.boardDescription,
    boardCategory: req.body.boardCategory,
    boardStatus: req.body.boardStatus,
    creator: {
      username: req.userData.fullName,
      authorId: req.userData.userId
    },
    created_dt: Date.now(),
  });
  board.save(function (err) {
    if (err) {
      return res.status(501).json({
        message: 'theres an error' + err
      });

    } else {
      //console.log(result);
      return res.status(200).json({
        // result:result,
        message: 'You successfully create a board'
      });
    }
  })
}
// module.exports.getMyBoard = (req, res, next) => {
//   var id = req.userData.userId;
//   board.find('creator')
//   .where('creator[0].authorId', id)
//   .exec()
//     .then(result  => {
//       return res.status(200).json(result);
//     }).catch(err => {
//       res.status(500).json(err);
//     });
// }

module.exports.getBoard = (req, res, next) => {
  //var id = req.userData.userId;
  //const creator = creator[0].authorId;
  Board.find({
      'creator.authorId': req.userData.userId
    })
    //.select('creator.authorId')
    //.where({'creator.authorId': req.userData.userId})
    .exec()
    .then(result => {

      return res.status(200).json(result);

    })
    .catch(err => {
      res.status(500).json(err);
    })
}
module.exports.deleteBoard = (req, res, next) => {
  const id = req.params.Id;
  const userid = req.userData.userId;

  Board.findById(id)
    .exec()
    .then(board => {
      const creator = board.creator[0].authorId
      if (creator === userid) {
        Board.findByIdAndDelete(id)
          .exec()
          .then(doc => {
            if (doc) {
              res.status(200).json({
                message: "Board Deleted"
              });
            } else {
              res.status(500).json({
                message: 'Invalid Id Number'
              });
            }
          })
          .catch(err => {
            res.status(501).json({
              error: err
            });
          });
      }
    })
    .catch()
}

module.exports.getBoardById = (req, res, next) => {
  const id = req.params.Id;
  // const userId = req.userData.userId;
  Board.findById(id)
    //.populate("events")
    .exec()
    .then(doc => {
      //console.log('user id:' + userId)
      //console.log('id in author:' +doc.creator[0].authorId);
      if (doc) {
        //console.log(doc);
        res.status(200).json(doc);
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

module.exports.createEvent = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host')
  req.userData;

  const event = new Event({
    eventName: req.body.eventName,
    address: req.body.address,
    shortDes: req.body.shortDes,
    fullDes: req.body.fullDes,
    eventUrl: url + '/' + req.file.path,
    startDate: req.body.startDate,
    finishDate: req.body.finishDate,
    board: req.body.board,
    status: req.body.status,
    category: req.body.category,
    time: req.body.time,
    organizer: {
      username: req.userData.fullName,
      id: req.userData.userId
    },
    created_dt: Date.now(),
  });
  event.save(function (err) {
    if (err) {
      return res.status(501).json(err);
    } else {
      return res.status(200).json({
        //result:result,
        //board: result.board,
        message: 'You successfully create an event'
      });
    }
  })

}

module.exports.editEvent = (req, res, next) => {
  const userId = req.userData.userId

  Event.findById(req.params.Id, function (err, event) {
    if (err) {
      res.status(501).json(err);
    }
    if (!event) {
      return res.status(404).json({
        message: 'Event Does not exist'
      });
    }
    const orgId = event.organizer[0].id
    if (userId === orgId) {
      const url = req.protocol + '://' + req.get('host');
      var eventName = req.body.eventName.trim();
      var address = req.body.address.trim();
      var shortDes = req.body.shortDes.trim();
      var fullDes = req.body.fullDes.trim();
      var startDate = req.body.startDate.trim();
      var finishDate = req.body.finishDate.trim();
      var board = req.body.board.trim();
      var status = req.body.status.trim();
      var category = req.body.category.trim();
      var time = req.body.time.trim();
      var eventUrl = url + '/' + req.file.path;

      event.eventName = eventName;
      event.address = address;
      event.shortDes = shortDes;
      event.fullDes = fullDes;
      event.startDate = startDate;
      event.finishDate = finishDate;
      event.board = board;
      event.status = status;
      event.category = category;
      event.time = time;
      event.eventUrl = eventUrl;

      // don't forget to save!
      event.save(function (err) {
        if (err) {
          return res.status(500).json({
            message: "Something happened" + err
          })
        }
        res.status(200).json({
          message: 'Edited Successfully'
        });
      });

    } else {
      res.status(501).json({
        message: "Access Denied"
      });
    }

  });




}


module.exports.getEvents = (req, res, next) => {
  Event.find()
    .exec()
    .then(result => {
      return res.status(200).json(result);
    })
    .catch(err => {
      res.status(500).json(err);
    })
}

module.exports.getEventsById = (req, res, next) => {
  const id = req.params.Id;
  Event.findById(id)
    .populate("comments")
    .exec()
    .then(doc => {
      if (doc) {
        res.status(200).json(doc);
      } else {
        res.status(404).json({
          message: 'Event not Found',
          status: 404
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
}

module.exports.deleteEvents = (req, res, next) => {
  const userid = req.userData.userId;
  const id = req.params.Id;
  if (userid === id) {
    Event.findByIdAndDelete(id)
      .exec()
      .then(doc => {
        if (doc) {
          res.status(200).json({
            message: "Event Deleted"
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
  } else {
    return res.status(500).json({
      message: " You're not authorized"
    })
  }

}

module.exports.Pinn = (req, res, next) => {
  Event.findById(req.params.Id)
    .exec()
    .then(doc => {
      const boards = req.body.boardId;
      Board.findById(boards)
        .exec()
        .then(board => {
          board.events.push(doc)
          board.save()
          return res.status(200).json({
            message: "Event pinned to board Successfully",
            // result: board
          })
        })
        .catch(error => {
          return res.status(501).json({
            message: "Something Happened: " + error
          })
        })

    })
    .catch(err => {
      return res.status(500).json({
        message: "Not Connecting" + err
      })
    })
}
module.exports.Unpin = (req, res, next) => {
  const boards = req.params.id;
  const event = req.body.eventId;
  Board.findOneAndUpdate({
      _id: req.params.id
    }, {
      $pull: {
        events: [event]
      }
    },
    function (err, success) {
      if (err) {
        console.log(err);
        return res.status(501).json({
          message: err
        })
      } else {
        console.log(success);
        return res.status(200).json({
          message: "Pulled Successfully",
          success: success
        })
      }
    }
  )
}
module.exports.getPinnedById = (req, res, next) => {
  const id = req.params.Id;
  Pinned.findById(id)
    .exec()
    .then(doc => {
      return res.status(200).json(doc);
    })
    .catch(err => {
      return res.status(500).json({
        error: err
      });
    });
}

module.exports.buyTicket = (req, res, next) => {
  Event.findById(req.params.Id)
    .exec()
    .then(event => {
      Ticket.create({
        eventId: event._id,
        purchasedBy: req.userData.userId,
        attendeeName: req.body.name,
        attendeeEmail: req.body.email,
        created_dt: Date.now()
      }).then(ticket => {
        ticket.save()
        event.tickets.addToSet(ticket);
        event.save();
        return res.status(200).json({
          message: 'Ticket has been generated Successfully'
        })
      }).catch(
        error => {
          return res.status(500).json({
            message: error
          })
        }
      )
    })
    .catch(err => {
      return res.status(501).json({
        message: err
      })
    })
}

module.exports.addComment = (req, res, next) => {
  Event.findById(req.params.Id, function (err, event) {
    if (err) {
      res.status(501).json(err);
    } else {
      Comment.create({
        text: req.body.text,
        authorName: req.userData.fullName,
        authorId: req.userData.userId,
        created_dt: Date.now(),
      }, function (err, comment) {
        if (err) {
          res.status(501).json(err);
        } else {
          //console.log(comment)
          comment.save();
          event.comments.push(comment);
          event.save()
          return res.status(200).json({
            result: event,
            message: 'You have successfully comment on an event'
          });
        }
      })
    }
  })
}

module.exports.deleteComment = (req, res, next) => {
  const id = req.params.Id;
  Event.find('comments')
  comment.findByIdAndDelete(id)
    .exec()
    .then(doc => {
      if (doc) {
        res.status(200).json({
          message: "Comment Deleted"
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





// module.exports.pinEvent = (req, res, next) => {
//   Event.findById(req.params.Id, function (err, board) {
//     if (err) {
//       res.status(501).json(err);
//     } else {
//       if (err) {
//         res.status(501).json(err);
//       } else {
//         Pinned.create(
//           {
//             pin:req.body.pin,
//             user_id:req.userData.userId,
//             created_dt:Date.now(),
//           },  function (err, pinned) {
//           if (err) {
//              res.status(501).json(err);
//           } else {
//             pinned.save();
//             board.events.push(pinned);
//             board.save()
//             return res.status(200).json({
//               result:event,
//               message:'You have successfully pinned event to board'
//             });
//           }
//         })
//       }
//     //   event.create(function (err) {
//     //     if (err) {
//     //         return res.status(501).json(err);
//     //     } else {
//     //         return res.status(200).json({
//     //           result:result,
//     //           message:'You successfully create an event'
//     //         });
//     //     }
//     // })
//     // board.event.push(event);
//     }
//   })

// }
