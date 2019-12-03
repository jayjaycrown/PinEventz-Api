const mongoose = require('mongoose');
const passport = require('passport');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

const User = mongoose.model('User');

module.exports.register = (req, res, next) => {
    var user= new User({
        fullName:req.body.fullName,
        username:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cityCountry:req.body.cityCountry,
        dateOfBirth:req.body.dateOfBirth,
        gender:req.body.gender,
        checkbox:req.body.checkbox,
        created_dt:Date.now()
        // facebookProvider: {
        //   type: {
        //         id: String,
        //         token: String
        //   },
        //   select: false
        //   },
      });
    user.save((err, doc) => {
        if (!err){
            res.send(doc);

        }

        else {
            if (err.code == 11000)
                res.status(422).send(['Duplicate email adrress or Name found.']);
            else
                return next(err);
        }

    });
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
            userId: user._id
          },
          process.env.JWT_SECRET,
           {
              expiresIn: process.env.JWT_EXP
           });
          return res.status(200).json({
            message: "Authentication Successful: hello: " + user.email,
            user: user,

            token: token,

          })

      }
        // unknown user or wrong password
        else return res.status(404).json(info);
    })(req, res);
}

module.exports.userProfile = (req, res, next) =>{
  res.status(200).json({
    message: "successful",
    user: res.locals.user
  });
  var user = req.user;
  res.render('profile', { title: 'profile', user: user });
}
module.exports.logout = (req, res, next) => {
  req.logout();
  res.status(200).json({
      'message': 'successfully logout'
  });
}

module.exports.interest =   (req,res, next) => {
    User.findOne({ _id: req._id }, function (err, user) {
        if (!user) {
          return res.status(500).json("Oops"+err);
        } else {
          My_Interest.create( {interest:req.body.interest},  function (err, inter) {
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
                message:'You have successfully select your area of interest'
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


  //get board by id
module.exports.singleUser = (req, res, next) => {
  const id = req.params.Id;
    User.findById(id)
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
}