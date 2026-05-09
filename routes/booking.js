const express = require("express");

const router = express.Router();

const wrapAsync = require("../utils/wrapAsync");

const { isLoggedIn } = require("../middleware");

const bookingController = require("../controllers/booking");

router.get(
    "/my",
    isLoggedIn,
    wrapAsync(bookingController.myBookings)
);

router.post(
    "/:id/book",
    isLoggedIn,
    wrapAsync(bookingController.createBooking)
);

router.delete(
    "/:bookingId",
    isLoggedIn,
    wrapAsync(bookingController.deleteBooking)
);

module.exports = router;