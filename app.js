require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const cookieParser = require("cookie-parser");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressError.js");
const User = require("./models/user.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRoutes = require("./routes/booking");

const dbUrl = process.env.ATLASDB_URL;
console.log("DB URL:", dbUrl);


async function main() {
    await mongoose.connect(dbUrl);
    console.log("Connected to DB");



    
    const store = MongoStore.create({
    mongoUrl: dbUrl,
    ttl: 24 * 60 * 60
});

    store.on("error", (err) => {
        console.log("SESSION STORE ERROR:", err);
    });

    
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));
    app.engine("ejs", engine);

    
    app.use(express.urlencoded({ extended: true }));
    app.use(methodOverride("_method"));
    app.use(express.static(path.join(__dirname, "public")));
    app.use(cookieParser());
    
    

    
    app.use(session({
        store,
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
        }
    }));

    app.use(flash());


    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    
    app.use((req, res, next) => {
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error");
        res.locals.currUser = req.user || null;
        next();
    });

    
    
     
    
    app.get("/", (req, res) => {
      console.log("LISTINGS ROUTE HIT");  
    return res.redirect("/listings");
});
    app.use("/listings", listings);
    app.use("/listings/:id/reviews", reviews);
    app.use("/", userRouter);
    app.use("/bookings", bookingRoutes);

    app.get("/privacy", (req, res) => {
    res.render("privacy");
});

app.get("/terms", (req, res) => {
    res.render("terms");
});

     

   
    app.all("*", (req, res, next) => {
        
        next(new ExpressError(404, "Page Not Found!"));
    });

    
    app.use((err, req, res, next) => {
        if (res.headersSent) {
            return next(err);
        }
        let { statusCode = 500, message = "Something went wrong!" } = err;
        return res.status(statusCode).render("err.ejs", { message });
    });

   
    const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log("Server is listening on port", PORT);
});
}

main().catch(err => console.log(err));