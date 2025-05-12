const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js"); // data.js export karega listings ka array

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wonderlust");
  console.log("DB connected");

  // Purana data delete karo
  await Listing.deleteMany({});
  console.log("Old data deleted");

  // Naya data insert karo
  await Listing.insertMany(initData.data); // data.js mein export karo 
  console.log("New data inserted");

  mongoose.connection.close();
}

main().catch((err) => {
  console.error(err);
});
