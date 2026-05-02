const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

// Create Review
module.exports.createReview = async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
     if (!req.body.review) {
        req.flash("error", "Invalid review data!");
        return res.redirect(`/listings/${id}`);
    }

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    listing.reviews.push(newReview._id);

    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Created!");
    return res.redirect(`/listings/${id}`);
};

// Delete Review
module.exports.deleteReview = async (req, res) => {
    let { id, reviewId } = req.params;

    let review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect(`/listings/${id}`);
    }

    await Listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId },
    });

    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted!");
    return res.redirect(`/listings/${id}`);
};