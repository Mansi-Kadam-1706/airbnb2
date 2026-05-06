const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const rateLimit = require("express-rate-limit");


module.exports.isLoggedIn =(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl; //Stores the page user was trying to visit
        req.flash("error","you must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner=async(req,res,next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
     if (!res.locals.currUser) {
        req.flash("error", "You must be logged in");
        return res.redirect("/login");
    }

    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.isReviewAuthor=async(req,res,next)=>{
    let {id,reviewId} = req.params;
    let review = await Review.findById(reviewId);
     if (!review) {
        req.flash("error", "Review not found");
        return res.redirect(`/listings/${id}`);
    }
    if (!res.locals.currUser) {
        req.flash("error", "You must be logged in");
        return res.redirect("/login");
    }
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of this Review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.loginLimiter = rateLimit({
     windowMs: 1 * 60 * 1000, 
     limit: 3, handler: (req, res) => { 
        req.flash("error", "Too many login attempts, try again later");
         return res.redirect("/login"); 
        } });