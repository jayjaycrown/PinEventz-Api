const mongoose=require('mongoose');
const Schema=mongoose.Schema

var EventSchema=mongoose.Schema({
    eventName:{
    	type:String,
        require:true,
    },
    address:{
        type:String,
        require:true
    },
    shortDes:{
        type:String,
        require:true
    },
    fullDes:{
        type:String,
        require:true
    }, 
    eventUrl:{
        type:String,
        require:true
    },
    startDate:{
       type:String
    },
    finishDate:{
        type:String
     },
     organizer:{
         id:{
             type:mongoose.Schema.Types.ObjectId,
             ref:"User"
         },
         username: String
     },
     comments: [
          {
              type: mongoose.Schema.ObjectId,
              ref: "Comment"
          }
     ],
    created_dt:{
        type:Date,
    	require:true
    },
});
module.exports=mongoose.model('Event',EventSchema);
