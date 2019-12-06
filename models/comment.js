const mongoose=require('mongoose');
const Schema=mongoose.Schema

const CommentSchema=mongoose.Schema({
    text:{
    	type:String,
    },
    authorName: {
        type:String,
    },
    authorId: {
        type: String
    },
    created_dt:{
        type:Date,
    	require:true
    },
});
module.exports=mongoose.model('Comment',CommentSchema);
