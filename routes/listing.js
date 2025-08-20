const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');

const Listing = require('../models/listing.js');
const { isLoggedIn, isOwner, validateListing } = require('../middleware.js');
const listingsController = require('../controllers/listings.js');
const multer  = require('multer');
const { storage } = require('../cloudConfig.js'); 

const upload = multer({ storage });

// 🔹 Search listings
router.get("/search", wrapAsync(listingsController.searchListings));

// 🔹 Index / list all listings
router.get("/", wrapAsync(listingsController.index));

// 🔹 Create new listing
router.get("/new", isLoggedIn, listingsController.renderNewForm);

router.post(
    "/",
    isLoggedIn,
    upload.single('listing[image]'),  // image upload
    validateListing,
    wrapAsync(listingsController.createListing)
);

// 🔹 Show single listing
router.get("/:id", wrapAsync(listingsController.showListing));

// 🔹 Edit listing
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingsController.renderEditForm));

// 🔹 Update listing
router.put(
    "/:id",
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingsController.updateListing)
);

// 🔹 Delete listing
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingsController.deleteListing));

module.exports = router;
