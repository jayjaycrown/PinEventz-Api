const mongoose = require('mongoose');

// mongoose.connect(process.env.MONGODB_URI, (err) => {
//     if (!err) { console.log('MongoDB connection succeeded.'); }
//     else { console.log('Error in MongoDB connection : ' + JSON.stringify(err, undefined, 2)); }
// });

require('./user.model');

// Database connection
const URL = process.env.MONGODB_URI;
// Database connection
// Database connection setup
mongoose.connect(URL, { useNewUrlParser: true, useCreateIndex: true })
.then(() => console.log("MongoDB successfully connected")).catch((err) => {
  console.log('Error in MongoDB connection : ' + JSON.stringify(err, undefined, 2));
});
