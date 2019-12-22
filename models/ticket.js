const mongoose = require('mongoose')

const ticketSchema =  mongoose.Schema({
    eventId: {
      type: String,
      required: true
    },
    purchasedBy: {
      type: String
    },
    attendeeName:{
      type: String,
    },
    attendeeEmail: {
      type: String,
    },
    created_dt:{
      type:Date,
    	require:true
    }
})
module.exports=mongoose.model('Ticket', ticketSchema)