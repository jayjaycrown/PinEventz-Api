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
     board:{
        type:String
     },
     status:{
        type:String
     },
     category:{
        type:String
     },
     time:{
        type:String
     },
     organizer:[{username : String, id: String}],
     comments: [
          {
              type: mongoose.Schema.ObjectId,
              ref: "Comment"
          }
     ],
     tickets: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Ticket"
        }
   ],
    created_dt:{
        type:Date,
    	require:true
    },
});
module.exports=mongoose.model('Event',EventSchema);
