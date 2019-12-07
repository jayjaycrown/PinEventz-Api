const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

var userSchema = new mongoose.Schema({
    fullName:{
    	type:String,
        required: 'Full name can\'t be empty',
        trim: true,
    },

    email:{
       type:String,
       required: 'Email can\'t be empty',
       trim: true,
       unique: true,
       match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    },
    password:{
        type:String,
        require:true,
        minlength: [4, 'Password must be atleast 4 character long'],
    },
    confirmPassword:{
        type: String,
        require:true
    },
    saltSecret: String,
    cityCountry:{
    	type:String,
        require:true,
        // trim: true,
        // unique: true,
    },
    profileUrl: {
        type: String
    },
    // prefix:{
    // 	type:String,
    // },
    dateOfBirth:{
    	type:String,
        require:true,
    },
    gender:{
        type:String,
        require:true,
    },
    checkbox:{
        type: String
    },
    // facebookProvider: {
    //     type: {
    //           id: String,
    //           token: String
    //     },
    //     select: false
    // },
    selected_interest: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "My_Interest"
        }
   ],
    created_dt:{
        type:Date,
    	require:true
    },
});

// Custom validation for email
userSchema.path('email').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');

// Events
userSchema.pre('save', function (next) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(this.password, salt, (err, hash) => {
            this.password = hash;
            this.saltSecret = salt;
            next();
        });
    });
});


// Methods
userSchema.methods.verifyPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.generateJwt = function () {
    return jwt.sign({ _id: this._id},
        process.env.JWT_SECRET,
    {
        expiresIn: process.env.JWT_EXP
    });
}



module.exports = mongoose.model('User', userSchema);