const mongoose = require("mongoose");
require('dotenv').config();

function connectDB(){
    mongoose.connect(process.env.MONGODB_URI)
    .then(()=>console.log("DB connected"))
    .catch((err)=>console.log(err));
}

module.exports = connectDB;