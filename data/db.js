const mongoose = require('mongoose');
const db = "mongodb+srv://ecommerce123:ecommerce123@cluster0.456b4ru.mongodb.net/";
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connection Success");
  })
  .catch(err => {
    console.log("Connection Error");
  });
