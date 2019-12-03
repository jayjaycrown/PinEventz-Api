const mongoose=require('mongoose');

var BoardSchema = new mongoose.Schema({
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
    boardStatus:{
        type:String,
    },
    created_dt:{
        type:Date,
    	require:true
    },
    creator:[{username : String, id: String}],

    // Event added to a board start
    events: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:  "Event"
        }
    ]
    // Event added to a board ends
});

module.exports = mongoose.model('Board', BoardSchema);
