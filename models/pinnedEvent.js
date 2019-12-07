const mongoose=require('mongoose');
const Schema=mongoose.Schema

const PinnedSchema=mongoose.Schema({
    pin:{
    	type:Boolean,
    },
    username: {
        type:String,
    },
    user_id: {
        type: String
    },
    created_dt:{
        type:Date,
    	require:true
    },
});
module.exports=mongoose.model('Pinned',PinnedSchema);