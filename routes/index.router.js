const express = require('express');
const router = express.Router();

const ctrlUser = require('../controllers/user.controller');

const jwtHelper = require('../config/jwtHelper');
const eventOwner= require('../config/eventOwner');

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
router.post('/resetpassword', ctrlUser.resetPassword);
router.post('/new-password', ctrlUser.NewPassword);
router.post('/valid-password-token', ctrlUser.ValidPasswordToken);
router.get('/logout', function(req, res, next) {
  req.logout();
   return res.status(200).json({message:'logout success'});
});


// User Section
router.get('/profile' ,jwtHelper, ctrlUser.userProfile);
router.put('/editprofile', jwtHelper,upload.single('profileUrl'), ctrlUser.editProfile);
router.post('/interest',  ctrlUser.interest);
router.get("/user",jwtHelper, ctrlUser.users);
router.get('/user/:Id', jwtHelper, ctrlUser.singleUser);


// Board section
router.get('/board',jwtHelper, ctrlUser.getBoard);
router.post('/board', jwtHelper,upload.single('boardUrl'), ctrlUser.createBoard);
router.delete('/board/:Id', jwtHelper, ctrlUser.deleteBoard);
router.get('/board/:Id', jwtHelper, ctrlUser.getBoardById);
router.put('/board/:Id', jwtHelper, ctrlUser.Unpin);
//router.get('/myboard', jwtHelper, ctrlUser.getMyBoard);

// Event Section
router.post('/event', jwtHelper,upload.single('eventUrl'), ctrlUser.createEvent);
router.get('/event',jwtHelper, ctrlUser.getEvents);
router.put('/editevent/:Id', jwtHelper,upload.single('eventUrl'), ctrlUser.editEvent);
router.delete('/event/:Id', jwtHelper, ctrlUser.deleteEvents);
router.get('/event/:Id', jwtHelper, ctrlUser.getEventsById);
router.post('/event/:Id/comment', jwtHelper, ctrlUser.addComment);
router.delete('/event/:Id/comment/:id', jwtHelper, ctrlUser.deleteComment);
router.post('/event/:Id', jwtHelper, ctrlUser.Pinn);
router.post('/event/:Id/ticket', jwtHelper, ctrlUser.buyTicket);
router.get('/pinned/:Id', jwtHelper, ctrlUser.getPinnedById);


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();
  res.status(400).json({
      'message': 'access denied'
  });
}

module.exports = router;
