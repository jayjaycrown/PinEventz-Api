const express = require('express');
const router = express.Router();

const ctrlUser = require('../controllers/user.controller');

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

router.post('/register', ctrlUser.register);
router.post('/login', ctrlUser.authenticate);
router.get('/profile' ,jwtHelper, ctrlUser.userProfile);
router.post('/interest',  ctrlUser.interest);

router.get("/user",jwtHelper, ctrlUser.users);
router.get('/user/:Id', jwtHelper, ctrlUser.singleUser);

router.get('/board',jwtHelper, ctrlUser.getBoard);
router.post('/board', jwtHelper,upload.single('boardUrl'), ctrlUser.createBoard);
router.delete('/board/:Id', jwtHelper, ctrlUser.deleteBoard);
router.get('/board/:Id', jwtHelper, ctrlUser.getBoardById);

router.get('/logout',isLoggedIn, function(req, res, next) {
  req.logout();
   return res.status(200).json({message:'logout success'});
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();
  res.status(400).json({
      'message': 'access denied'
  });
}

module.exports = router;
