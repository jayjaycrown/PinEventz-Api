const mongoose=require('mongoose');
const Schema=mongoose.Schema

const BoardSchema=mongoose.Schema({
    boardName:{
    	type:String,
        require:true,
    },
    boardUrl:{
        type:String,
    },
    boardDescription:{
        type:String,
    },
    boardCategory:{
        type:String,
    },
    created_dt:{
        type:Date,
    	require:true
    },
    // Event added to a board start
    events: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:  "Event"
        }
    ]
    // Event added to a board ends
});
module.exports=mongoose.model('Board',BoardSchema);
