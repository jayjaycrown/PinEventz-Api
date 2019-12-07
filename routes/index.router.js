const express = require('express');
const router = express.Router();

const ctrlUser = require('../controllers/user.controller');

const jwtHelper = require('../config/jwtHelper');

const multer=require('multer');
// Multer File upload settings

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

 // Authentication Section
router.post('/register', ctrlUser.register);
router.post('/login', ctrlUser.authenticate);
router.get('/logout',isLoggedIn, function(req, res, next) {
  req.logout();
   return res.status(200).json({message:'logout success'});
});


// User Section
router.get('/profile' ,jwtHelper, ctrlUser.userProfile);
router.post('/editprofile', jwtHelper,upload.single('profileUrl'), ctrlUser.editProfile);
router.post('/interest',  ctrlUser.interest);
router.get("/user",jwtHelper, ctrlUser.users);
router.get('/user/:Id', jwtHelper, ctrlUser.singleUser);

// Board section
router.get('/board',jwtHelper, ctrlUser.getBoard);
router.post('/board', jwtHelper,upload.single('boardUrl'), ctrlUser.createBoard);
router.delete('/board/:Id', jwtHelper, ctrlUser.deleteBoard);
router.get('/board/:Id', jwtHelper, ctrlUser.getBoardById);
//router.get('/myboard', jwtHelper, ctrlUser.getMyBoard);

// Event Section
router.post('/event', jwtHelper,upload.single('eventUrl'), ctrlUser.createEvent);
router.get('/event',jwtHelper, ctrlUser.getEvents);
router.delete('/event/:Id', eventOwner, jwtHelper, ctrlUser.deleteEvents);
router.get('/event/:Id', jwtHelper, ctrlUser.getEventsById);
router.post('/event/:Id/comment', jwtHelper, ctrlUser.addComment);
router.delete('/event/:Id/comment/:id', jwtHelper, ctrlUser.deleteComment);

function eventOwner(req,res,next) {
  if (req.isAuthenticated()) {
       Event.findById(req.params.id, function (err,result) {
         if (err) {
           return res.status(501).json(err);
         } else {
           if (result.organizer.id.equals(req.userData.userId)) {
           next();
           } else {
             console.log('Permission not granted');
           }
         }
       })
  }
}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();
  res.status(400).json({
      'message': 'access denied'
  });
}

module.exports = router;
