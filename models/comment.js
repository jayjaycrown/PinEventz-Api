const mongoose=require('mongoose');
const Schema=mongoose.Schema

const CommentSchema=mongoose.Schema({
    text:{
    	type:String,
    },
    author:{
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
module.exports=mongoose.model('Comment',CommentSchema);
