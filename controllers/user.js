const User = require("../models/user");

// Render Signup
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup");
};

// Signup
module.exports.signup = async (req, res, next) => {
    try {
        let { username, email, password ,role} = req.body;

         if (!username || !email || !password ) {
            req.flash("error", "All fields are required");
            return res.redirect("/signup");
        }

        const newUser = new User({ email, username ,role});
        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);

            req.flash("success", "Welcome to Wanderlust!");
            return res.redirect("/listings");
        });

    } catch (e) {
        req.flash("error", e.message);
        return res.redirect("/signup");
    }
};

// Render Login
module.exports.renderLoginForm = (req, res) => {
    return res.render("users/login");
};

// Login
module.exports.login = (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    return res.redirect(redirectUrl);
};

// Logout
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);

        req.flash("success", "Logged out!");
        return res.redirect("/listings");
    });
};