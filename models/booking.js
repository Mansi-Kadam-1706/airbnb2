const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "listing"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    checkIn: Date,
    checkOut: Date,
     totalPrice: Number

    
});

module.exports = mongoose.model("Booking", bookingSchema);

