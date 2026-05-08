const express = require("express");
const router = express.Router();
const wrapAsync= require("../utils/wrapAsync.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn,isOwner,isReviewAuthor} = require("../middleware");
const {saveRedirectUrl} = require("../middleware");
const listingController = require("../controllers/listing.js");
const Booking = require("../models/booking");



router.post("/:id/book", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut } = req.body;

    if (new Date(checkOut) <= new Date(checkIn)) {
        req.flash("error", "Invalid dates");
        return res.redirect("back");
    }

    const existingBooking = await Booking.findOne({
         listing: id,
        checkIn: { $lt: new Date(checkOut) },
        checkOut: { $gt: new Date(checkIn) }
    })
     if (existingBooking) {
        req.flash("error", "This place is already booked for selected dates!");
        return res.redirect("back");
    }

    const booking = new Booking({
        listing: id,
        user: req.user._id,
        checkIn,
        checkOut
    });

    await booking.save();

    req.flash("success", "Booking confirmed!");
    res.redirect(`/listings/${id}`);
});
module.exports = router; 