const mongoose=require('mongoose');
const Schema=mongoose.Schema

var InterestSchema=mongoose.Schema({

    interestTitle:{
        type:String,
        require: true,
    },
    interestIcon:{
        type:String,
        require: true,
    },
    interestDescription:{
        type:String,
        require:true,
    },
    interestChooser:{
         id: {
             type: mongoose.Schema.Types.ObjectId,
             ref: 'User'
         },
         username:{
             type: String
         }
    },
    created_dt:{
        type:Date,
    	require:true
    }
});
module.exports=mongoose.model('Interest',InterestSchema);