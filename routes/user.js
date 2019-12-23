const express=require('express');
const router=express.Router();
const passport=require('passport');
const cloudinary = require('cloudinary');
const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');
const User=require('../models/user.model');
const Interest=require('../models/interest');
const My_Interest=require('../models/my_interest');
const Board = require('../models/board');
const Event = require('../models/event');
const Comment = require('../models/comment');
const user = require('../controllers/user.controller');
require('../config/passportConfig');
const jwtHelper = require('../config/jwtHelper');
const multer=require('multer');
// Multer File upload settings
const DIR = './uploads/';

// section to create board by authenticated user
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
   },
  filename: function (req, file, cb) {
    cb(null, file.fieldname +  '-' + Date.now() +  '-' + file.originalname);
   }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg"){
    cb(null, true)
  } else {
    return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }


};
const upload  = multer({
  storage: storage,
  limits: {
  fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
 });

// Function to create event
// const uploadEvent=multer({
//   storage:storage,
//   limits:{fileSize :1024*1024*5},
//    fileFilter:fileFilter
//  });
// user section
router.get('', function(req, res, next) {
    return res.send('User Section to render user action!');
 });
// Router to create interest by admin
router.post('/interest',   function (req,res) {
  const token = req.body.jwt;
  const x = jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
      if (err) throw err;
      console.log(decoded);
  })
    var interest= new Interest({
        interestIcon:req.body.requestIcon,
        interestTitle:req.body.interestTitle,
        interestDescription:req.body.interestDescription,
        created_dt:Date.now()
    })
    interest.save(function (err,result) {
        if (err) {
          return res.status(501).json()
        }else{
          const token = req.body.jwt;
          console.log('token: ' + token);
         return res.status(200).json({
            message:'Interest has been created Succesfully' + token,
          })
        };
      })
})
// section to get interest
// isValidUser,
router.get('/interests',jwtHelper, function (req,res) {
    Interest.find()
    .select('interestTitle interestDescription interestIcon')
    .exec()
          .then(result => {
                 return res.status(200).json(result);
          })
          .catch(err => {
              res.status(500).json(err);
          })
})
// Section for user select area to them self
// isValidUser,
router.post('/select',    function (req,res) {
  // const id = res.user.user_id
  User.findById(req.params.user_id, function (err, result) {
      if (err) {
        return res.status(500).json(err);
      } else {
        My_Interest.create( {interest:req.body.interest},  function (err, inter) {
          if (err) {
            return res.status(501).json(err);
          } else {
            // section to add the user detail
             inter.chooser.id = req.user._id;
             inter.chooser.username = req.user.username;
             inter.save()
             result.selected_interest.push(inter);
             result.save()
            return res.status(200).json({
              result:result,
              message:'You have successfully select your area of interest'
            });
          }
        })
      }
  })
})


router.put('/updateUser', jwtHelper,upload.single('profileUrl'), async (req, res) => {
  const url = req.protocol + '://' + req.get('host')

  const email = req.body.email;
  const fullName = req.body.fullName;
  const cityCountry = req.body.cityCountry;
  const gender = req.body.gender;
  const dateOfBirth= req.body.dateOfBirth;
  const profileUrl = url + '/' + req.file.path;
  const id = req.userData.userId

  try {
      await User.update({
        email : email,
       fullName : fullName,
        cityCountry : cityCountry,
        gender : gender,
        dateOfBirth : dateOfBirth,
        profileUrl : profileUrl
      }, {
              where: {
                  id: id
              }
          })
      return res.send({ message: 'User created' });
  }
  catch (ex) {
      console.error(ex);
      res.status(400);
      return res.send({ error: ex });
  }});




// })
// Function to get board
// router.get('/board', jwtHelper, function (req,res) {
//   Board.find()
//   .exec()
//         .then(result => {
//                return res.status(200).json(result);
//         })
//         .catch(err => {
//             res.status(500).json(err);
//         })

// })

// Function to create event
// isValidUser,

// Function to get all event

// Function to get event by id
router.get('/event/:Id', function (req,res) {
  const id = req.params.Id;
    Event.findById(id)
    .select('_id eventUrl eventName address fullDes startDate  finishDate  createdDt')
    .populate("comments")
    .exec()
    .then(doc=>{
       if(doc){
        res.status(200).json(doc);
       }else{
        res.status(200).json({
          message:'Invalid Id Number'
        });
       }
      })
      .catch(err=>{
        res.status(500).json({
            error:err
         });
      });
})


// Function to pin event to board
router.post('/pin/:Id/event', function (req,res) {
    Board.findById(req.params.Id)
})
// Function to allow organizer delete event
router.delete('/event/:id',eventOwner, function (req,res) {
  Event.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
      res.status(501).json(err);
    } else {
      res.status(200).json({
        message:"event has been successfully removed"
      });
    }
  })
})


// Funtion to check for the organizer of a evemt
function eventOwner(req,res,next) {
  if (req.isAuthenticated()) {
       Event.findById(req.params.id, function (err,result) {
         if (err) {
           return res.status(501).json(err);
         } else {
           if (result.organizer.id.equals(res.user._id)) {
           next();
           } else {
             console.log('Permission not granted');
           }
         }
       })
  }
}
// Function to check user authentication
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();
  res.status(400).json({
      'message': 'access denied'
  });
}

// app.post('/editProfile', isLoggedIn, function(req, res, next){

  // User.findById(req.user.id, function (err, user) {

  //     // todo: don't forget to handle err

  //     if (!user) {
  //         req.flash('error', 'No account found');
  //         return res.redirect('/edit');
  //     }

  //     // good idea to trim
  //     var email = req.body.email.trim();
  //     var username = req.body.username.trim();
  //     var firstname = req.body.firstname.trim();
  //     var lastname = req.body.lastname.trim();

  //     // validate
  //     if (!email || !username || !firstname || !lastname) { // simplified: '' is a falsey
  //         req.flash('error', 'One or more fields are empty');
  //         return res.redirect('/edit'); // modified
  //     }

  //     // no need for else since you are returning early ^
  //     user.email = email;
  //     user.local.email = email; // why do you have two? oh well
  //     user.first_name = firstname;
  //     user.last_name = lastname;
  //     user.username = username;

  //     // don't forget to save!
  //     user.save(function (err) {

  //         // todo: don't forget to handle err

  //         res.redirect('/profile/');
  //     });
  // });
// });




module.exports=router;