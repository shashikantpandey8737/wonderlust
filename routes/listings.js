const express = require("express");
const router = express.Router();
const listings = require("../controllers/listings");

router.get("/search", listings.searchListings);
// ...baaki routes...