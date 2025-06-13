const Listing = require('./models/listing');
const Review = require('./models/review');
const { listingSchema , reviewSchema, } = require('./schema.js');
const ExpressError = require('./utils/ExpressError.js');


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash('error', 'You must be logged in to create a listing!');
        return res.redirect('/login');
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async(req, res, next) => {
     let { id } = req.params;
   let listing = await Listing.findById(id);
if (!listing.owner || !listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/listings/${id}`);
}
next();
}


module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);  
    if (error) {
        let errmsg = error.details.map(el => el.message).join(', ');
        req.flash('error', errmsg); // custom error message flash karo
        const redirectUrl = req.get('Referrer') || '/listings/new'; // form par wapas bhejo
        return res.redirect(redirectUrl);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);  // सही तरीके से validate करें
    if (error) {
        let errmsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, errmsg);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async(req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review || !review.owner || !review.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}