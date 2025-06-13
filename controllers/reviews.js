const Listing = require("../models/listing");
const Review = require("../models/review");


module.exports.createReview=async (req, res) => {
 
 let listing=   await Listing.findById(req.params.id);
let newReview = new Review(req.body.review);
newReview.owner = req.user._id; // <-- yahi sahi hai!
await newReview.save();
listing.reviews.push(newReview);
await listing.save(); 
req.flash("success", "Review added!");

res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview = async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted the review!");
    res.redirect(`/listings/${id}`);
}