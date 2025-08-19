const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');

const Listing = require('../models/listing.js');
const { isLoggedIn, isOwner, validateListing } = require('../middleware.js');
const listingsController = require('../controllers/listings.js');
const multer  = require('multer');
const {storage} = require('../cloudConfig.js'); 

const upload = multer({ storage});

// Search listingsconst express = require("express");

const listings = require("../controllers/listings");

router.get("/search", listings.searchListings);
// ...baaki routes...
 
//create a new listing
router.route("/")
    .get(wrapAsync(listingsController.index))
    .post(
        isLoggedIn,
        upload.single('listing[image]'), // <-- yahan sirf [image]
        validateListing,
        wrapAsync(listingsController.createListing)
    );

router.get("/new", isLoggedIn, listingsController.renderNewForm);

// update a listing
router.route("/:id")
    .get(wrapAsync(listingsController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingsController.updateListing)
    )
    .delete(isLoggedIn, isOwner, wrapAsync(listingsController.deleteListing));

// edit a listing
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingsController.renderEditForm));

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate('author');
    if (!listing) {
        req.flash('error', 'Cannot find that listing!');
        return res.redirect('/listings');
    }
});
// GET Forgot Password page
app.get("/forgot-password", (req, res) => {
  res.render("users/forgot-password"); 
});

// POST Forgot Password form
app.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  // Yaha pe apni reset-password logic likho
  console.log("Reset link send to:", email);
  res.send("Reset link has been sent to your email!");
});

module.exports = router;