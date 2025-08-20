const Listing = require("../models/listing");
const mbxgeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxgeocoding({ accessToken: mapToken });



// Index route
module.exports.index = async (req, res) => {
    const listings = await Listing.find({});
    res.render("listings/index.ejs", { listings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("owner");
    res.render("listings/show", { listing, currUser: req.user });
};


// module.exports.showListing = async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id)
//         .populate({
//             path: "reviews",
//             populate: { path: "owner" }
//         })
//         .populate("owner"); 

//     if (!listing) {
//         req.flash("error", "Cannot find that listing!");
//         return res.redirect("/listings");
//     }
//     res.render("listings/show.ejs", { listing });
// };

// Create a new listing

module.exports.createListing = async (req, res,next) => {
 let response = await  geocodingClient
 .forwardGeocode({
  query: req.body.listing.location,
  limit: 1
  
})
  .send()
 

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.geometry = response.body.features[0].geometry; // ✅ Hamesha set karo

    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        newListing.image = { url, filename };
    }
     let savedListing = await newListing.save();
     console.log(savedListing);
    req.flash("success", "Successfully created a new listing!");
    res.redirect('/listings');
}

// Render the edit form for a listing
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}
// Update a listing
module.exports.updateListing =async (req, res) => {
     let { id } = req.params;
    const updatedListing = await Listing.findByIdAndUpdate
    (id, { ...req.body.listing }, { new: true, runValidators: true });
   
    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        updatedListing.image = { url, filename }; // ✅ Sahi
        await updatedListing.save();
    }
    req.flash("success", "Successfully updated the listing!");

    res.redirect(`/listings/${updatedListing._id}`);
}
// Delete a listing
module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted the listing!");
    res.redirect("/listings");
}

// Search route
module.exports.searchListings = async (req, res) => {
    const query = req.query.q;
    const listings = await Listing.find({
        $or: [
            { title: { $regex: query, $options: "i" } },
            { location: { $regex: query, $options: "i" } },
            { country: { $regex: query, $options: "i" } }
        ]
    });
    res.render("listings/index.ejs", { listings });
};
module.exports.getForgotPassword = (req, res) => {
  res.render("users/forgot-password"); // looks inside views/users/forgot-password.ejs
};



