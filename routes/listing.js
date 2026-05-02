const express = require("express");
const router = express.Router();
const wrapAsync= require("../utils/wrapAsync.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn,isOwner,isReviewAuthor} = require("../middleware");
const {saveRedirectUrl} = require("../middleware");
const listingController = require("../controllers/listing.js");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js");
const upload = multer({storage})



const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        throw error
    }else{
        next();
    }
};


// Index
router.get("/", wrapAsync(listingController.index));

// New
router.get("/new", isLoggedIn, listingController.renderNewForm);



// Show
router.get("/:id", wrapAsync(listingController.showListing));

// Create
router.post("/", isLoggedIn, upload.single("listing[image]"),validateListing, wrapAsync(listingController.createListing));

// Edit
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// Update
router.put("/:id", isLoggedIn, isOwner, upload.single("listing[image]"),validateListing, wrapAsync(listingController.updateListing));

// Delete
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));




module.exports =router;