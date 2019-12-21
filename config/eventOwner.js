module.exports =(req, res, next) => {

  try {
    Event.findById( req.params.Id)
    .exec()
    .then(result => {
       console.log(result)
         if (result.organizer[0]._id.equals(req.userData.userId)) {
          next();
         } else {
           console.log('Permission not granted');
         }

    })
} catch (error) {
    return res.status(401).json({
        message: "Access Denied",
         error
    })
}

}