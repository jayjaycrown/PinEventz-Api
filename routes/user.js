const express=require('express');
const router=express.Router();
const multer=require('multer');
const passport=require('passport');
const cloudinary = require('cloudinary');
const dotenv = require('dotenv').config();
const User=require('../models/user.model');
const Interest=require('../models/interest');
const My_Interest=require('../models/my_interest');
const Board = require('../models/board');
const Event = require('../models/event');
const Comment = require('../models/comment');
const user = require('../controllers/user.controller');

// section to intialize cloudinary
cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key:process.env.API_KEY,
  api_secret:process.env.API_SECRET
})
// section to create board by authenticated user
const storage = multer.diskStorage({
  name:function (req,file,cb) {
     var datetimestamp = Date.now();
     cb(null, file.fieldname + '-' + Date.now());
     filepath = datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1];
    cb(null, filepath);
  }
});
const fileFilter=(req,file,cb)=> {
//reject a file
if (file.mimetype==='image/jpeg' || 'image/png' ) {
  cb(null,true);
}else{
  cb(null,false);
 }
}
// Function to create board
const uploadBoard=multer({
 storage:storage,
 limits:{fileSize :1024*1024*5},
  fileFilter:fileFilter
});
// Function to create event
const uploadEvent=multer({
  storage:storage,
  limits:{fileSize :1024*1024*5},
   fileFilter:fileFilter
 });
// user section
router.get('', function(req, res, next) {
    return res.send('User Section to render user action!');
 });
// Router to create interest by admin
router.post('/interest',   function (req,res) {
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
         return res.status(200).json({
            message:'Interest has been created Succesfully',
          })
        };
      })
})
// section to get interest
// isValidUser,
router.get('/interests', function (req,res) {
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
// Function to create board to pin event to
router.post('/board', uploadBoard.single('image'),  function (req,res) {
  // console.log(req.file);
  cloudinary.v2.uploader.upload(req.file.path, function (err,result) {
    if (err) {
      console.log(err);
        return res.status(501).json(err);
    } else {
        req.body.image = result.secure_url;
        const author = {
          username: req.user.username,
          id:req.user._id
        }
        const author = {
            username: req.user.username,
            id:req.users._id
          }
        const board = new Board ({
            boardUrl:req.body.image,
            boardName:req.body.boardName,
            boardDescription:req.body.boardDescription,
            boardCategory: req.body.boardCategory,
            creator:author,
            created_dt:Date.now(),
        });
        board.save(function (err) {
          if (err) {
                return res.status(501).json(err);
            }
            else {
                return res.status(200).json({
                  result:result,
                  message:'You successfully create a board'
                });
            }
        })
    }
  })

  //delete board
router.delete('/board/:Id', function(req, res) {
  const id = req.params.Id;
    Board.findByIdAndDelete(id)
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
//get board by id
router.get('/board/:Id', function (req,res) {
  const id = req.params.Id;
    Board.findById(id)
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

// })
// Function to get board
router.get('/board', function (req,res) {
  Board.find()
  .exec()
        .then(result => {
               return res.status(200).json(result);
        })
        .catch(err => {
            res.status(500).json(err);
        })

})

// Function to create event
// isValidUser,
router.post('/event',  function (req,res) {


        // const organizer = {
        //   id : req.user._id,
        //   username : req.user.username
        // }
        req.body.image = result.secure_url;
        const event = new Event ({
           // organizer:organizer,
            eventUrl:req.body.eventUrl,
            eventName:req.body.eventName,
            address:req.body.address,
            shortDes:req.body.shortDes,
            fullDes:req.body.fullDes,
            startDate:req.body.startDate,
            finishDate:req.body.finishDate,
            created_dt:Date.now(),
        });
        event.save(function (err) {
            if (err) {
                return res.status(501).json(err);
            } else {
                return res.status(200).json({
                  //result:result,
                  message:'You successfully create an event'
                });
            }
        })


})
// Function to get all event
router.get('/event', function (req,res) {
  Event.find()
  .select('finishDate startDate fullDes shortDes address eventName eventUrl organizer.username organizer._id')
  .exec()
        .then(result => {
               return res.status(200).json(result);
        })
        .catch(err => {
            res.status(500).json(err);
        })
})
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
// Function to add comment to event
router.post('/event/:Id/comment', function (req,res) {
  Event.findById(req.params.Id, function (err,event) {
        if (err) {
          res.status(501).json(err);
        } else {
          Comment.create( {text:req.body.text},  function (err, comment) {
            if (err) {
               res.status(501).json(err);
            } else {
              // section to add the user detail
              //  comment.author.id = req.user._id;
              //  comment.author.username = req.user.username;
              comment.save();
              event.comments.push(comment);
              event.save()
              return res.status(200).json({
                result:event,
                message:'You have successfully comment on an event'
              });
            }
          })
        }
  } )
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
function isValidUser(req,res,next) {
    if (req.isAuthenticated()) next();
    else return res.status(401).json({message:'Unauthorized Request'});
}
module.exports=router;