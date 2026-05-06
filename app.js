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

const dbUrl = process.env.ATLASDB_URL;
console.log("DB URL:", dbUrl);

// ================= DB CONNECT + SERVER START =================

async function main() {
    await mongoose.connect(dbUrl);
    console.log("Connected to DB");



    // ✅ SESSION STORE (AFTER DB CONNECT)
    const store = MongoStore.create({
    mongoUrl: dbUrl,
    ttl: 24 * 60 * 60
});

    store.on("error", (err) => {
        console.log("SESSION STORE ERROR:", err);
    });

    // ================= VIEW ENGINE =================
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));
    app.engine("ejs", engine);

    // ================= MIDDLEWARE =================
    app.use(express.urlencoded({ extended: true }));
    app.use(methodOverride("_method"));
    app.use(express.static(path.join(__dirname, "public")));
    app.use(cookieParser());
    
    

    // ================= SESSION =================
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

    // ================= PASSPORT =================
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    // ================= GLOBAL LOCALS =================
    app.use((req, res, next) => {
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error");
        res.locals.currUser = req.user || null;
        next();
    });

    
    
     
    // ================= ROUTES =================
    app.get("/", (req, res) => {
      console.log("LISTINGS ROUTE HIT");  
    return res.redirect("/listings");
});
    app.use("/listings", listings);
    app.use("/listings/:id/reviews", reviews);
    app.use("/", userRouter);

     

    // ================= 404 =================
    app.all("*", (req, res, next) => {
        
        next(new ExpressError(404, "Page Not Found!"));
    });

    // ================= ERROR HANDLER =================
    app.use((err, req, res, next) => {
        if (res.headersSent) {
            return next(err);
        }
        let { statusCode = 500, message = "Something went wrong!" } = err;
        return res.status(statusCode).render("err.ejs", { message });
    });

    // ================= SERVER =================
    const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log("Server is listening on port", PORT);
});
}

main().catch(err => console.log(err));