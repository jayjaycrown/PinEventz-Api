const mongoose=require('mongoose');
const Schema=mongoose.Schema

const PinnedSchema=mongoose.Schema({
    eventId: {
        type: String,
    },
    pinner: {
        type: String
    },
    eventUrl:{
    	type:String,
    },
    eventName:{
    	type:String,
        require:true,
    },
    startDate:{
    	type:String,
    },
    finishDate:{
    	type:String,
    },
    status:{
    	type:String,
    },
    category:{
    	type:String,
    },
    time:{
    	type:String,
    },
    organizer:[{username : String, id: String}],

    created_dt:{
        type:Date,
    	require:true
    },
});
module.exports=mongoose.model('Pinned',PinnedSchema);