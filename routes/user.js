const express = require("express");
const router = express.Router();

const passport = require("passport");
const userController = require("../controllers/user.js");
const { saveRedirectUrl } = require("../middleware");
const { loginLimiter } = require("../middleware.js");

// Signup
router.get("/signup", userController.renderSignupForm);
router.post("/signup", userController.signup);

// Login
router.get("/login", userController.renderLoginForm);

router.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    userController.login
);

// Logout
router.get("/logout", userController.logout);

module.exports = router;