const express = require("express");

const router = express.Router();

const wrapAsync = require("../utils/wrapAsync");

const { isLoggedIn , isCustomer } = require("../middleware");

const bookingController = require("../controllers/booking");

router.get(
    "/my",
    isLoggedIn,
    wrapAsync(bookingController.myBookings)
);

router.post(
    "/:id/book",
    isLoggedIn,
    isCustomer,
    wrapAsync(bookingController.createBooking)
);

router.delete(
    "/:bookingId",
    isLoggedIn,
    wrapAsync(bookingController.deleteBooking)
);

module.exports = router;