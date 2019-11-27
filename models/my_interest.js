const mongoose=require('mongoose');
const Schema=mongoose.Schema

const My_InterestSchema=mongoose.Schema({
    interest:{
    	type:String,
    },
    chooser:{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User" 
        },
        username:String
    },
    created_dt:{
        type:Date,
    	require:true
    },
});
module.exports=mongoose.model('My_Interest', My_InterestSchema);
