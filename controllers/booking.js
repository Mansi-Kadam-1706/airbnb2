const Booking = require("../models/booking");

module.exports.myBookings = async (req, res) => {

    const bookings = await Booking.find({
        user: req.user._id
    }).populate("listing");

    res.render("bookings/index", { bookings });
};

module.exports.createBooking = async (req, res) => {

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

    });

    if (existingBooking) {

        req.flash(
            "error",
            "This place is already booked for selected dates!"
        );

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
};

module.exports.deleteBooking = async (req, res) => {

    const { bookingId } = req.params;

    await Booking.findByIdAndDelete(bookingId);
     if (!booking.user.equals(req.user._id)) {

        req.flash("error", "You are not allowed!");

        return res.redirect("/bookings/my");
    }

    req.flash("success", "Booking cancelled");

    res.redirect("/bookings/my");
};