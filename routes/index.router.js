const express = require('express');
const router = express.Router();

const ctrlUser = require('../controllers/user.controller');

const jwtHelper = require('../config/jwtHelper');

router.post('/register', ctrlUser.register);
router.post('/login', ctrlUser.authenticate);
router.get('/profile',jwtHelper.verifyJwtToken, ctrlUser.userProfile);
router.post('/interest',  ctrlUser.interest)
router.get('/logout',isValidUser, function(req, res, next) {
  req.logout();
   return res.status(200).json({message:'logout success'});
});

function isValidUser(req,res,next) {
  if (req.isAuthenticated()) next();
  else return res.status(401).json({message:'Unauthorized Request'});
}

module.exports = router;
