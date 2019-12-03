const express = require('express');
const router = express.Router();

const ctrlUser = require('../controllers/user.controller');

const jwtHelper = require('../config/jwtHelper');

router.post('/register', ctrlUser.register);
router.post('/login', ctrlUser.authenticate);
router.get('/profile' ,jwtHelper, ctrlUser.userProfile);
router.post('/interest',  ctrlUser.interest);
router.get("/user",jwtHelper, ctrlUser.users);
router.get('/user/:Id', jwtHelper, ctrlUser.singleUser)
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
