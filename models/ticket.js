const mongoose = require('mongoose')

const ticketSchema = new mongoose.Schema({
    eventId: {
      type: String,
      required: true
    },
    purchasedBy: {
      type: String
    },
    attendeeName:{
      type: String,
      required: true
    },
    attendeeEmail: {
      type: String,
      required: true
    },
    created_dt:{
      type:Date,
    	require:true
    }
})
module.exports=mongoose.model('Ticket', ticketSchema)