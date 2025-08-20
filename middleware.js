const Listing = require('./models/listing');
const Review = require('./models/review');
const { listingSchema, reviewSchema } = require('./schema.js');
const ExpressError = require('./utils/ExpressError.js');

// ✅ Check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash('error', 'You must be logged in to do that!');
        return res.redirect('/login');
    }
    next();
};

// ✅ Save redirect URL for post-login redirect
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

// ✅ Check if current user is the owner of a listing
module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing || !listing.owner || !listing.owner.equals(res.locals.currentUser._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// ✅ Validate listing data using Joi schema
module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errmsg = error.details.map(el => el.message).join(', ');
        req.flash('error', errmsg);
        const redirectUrl = req.get('Referrer') || '/listings/new';
        return res.redirect(redirectUrl);
    }
    next();
};

// ✅ Validate review data using Joi schema
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errmsg = error.details.map(el => el.message).join(', ');
        req.flash('error', errmsg);
        const redirectUrl = req.get('Referrer') || '/listings';
        return res.redirect(redirectUrl);
    }
    next();
};

// ✅ Check if current user is the author of a review
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review || !review.owner || !review.owner.equals(res.locals.currentUser._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/listings/${id}`);
    }
    next();
};
