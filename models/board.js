const mongoose=require('mongoose');
const Schema=mongoose.Schema

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
    creator:[{username : String, authorId: String}],


    events: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Comment"
        }
   ],
   created_dt:{
    type:Date,
    require:true
}
});

module.exports = mongoose.model('Board', BoardSchema);
