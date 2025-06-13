const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js"); 

const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust"

 main() 
 .then(() => {
     console.log("Connected to MongoDB");
 }
  ).catch(err => {
      console.log(err); 
  }
);
async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
   initData.data=   initData.data.map((obj) =>({...obj, owner:'68286e3b2f6e61c70fdc4867'}))
  await Listing.insertMany(initData.data);
  console.log("Database initialized with new data");
};

initDB();


  