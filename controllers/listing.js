const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const ExpressError = require("../utils/ExpressError.js");
const cloudinary = require("../cloudConfig"); 
const Booking = require("../models/booking");


const geocoder = mbxGeocoding({
    accessToken: process.env.MAP_TOKEN
});

// Index Route
module.exports.index = async (req, res) => {
   const { category, q } = req.query;

   let filter = {};

   if (category) {
      filter.category = category;
   }

   if (q) {
      filter.title = { $regex: q, $options: "i" };
   }

   const allListings = await Listing.find(filter);

   for(let listing of allListings){
    const booking = await Booking.findOne({listing: listing._id,user:{$ne: req.user?._id}});

    listing.isBooked = booking ? true:false;
   }

   res.render("listings/index", { allListings });
};

// New Form
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
};

// Show Route
module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author" },
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    return res.render("listings/show", { listing ,mapToken : process.env.MAP_TOKEN });
};

// Create Route
module.exports.createListing = async (req, res) => {
     if(!req.body.listing){
        throw new ExpressError(400,"send valid data for listing");
    }
   let response= await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1,
})
  .send();
  if (!response.body.features.length) {
        throw new ExpressError(400, "Invalid location");
    }
  

    let url , filename ;
    if (req.file) {
        url = req.file.path;
        filename = req.file.filename;
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    if (url && filename) {
        newListing.image = { url, filename };
    }

    newListing.geometry = response.body.features[0].geometry;

    await newListing.save();

    req.flash("success", "New Listing Created!");
    return res.redirect("/listings");
};

// Edit Form
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image?.url || "";
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

    res.render("listings/edit", { listing, originalImageUrl });
};

// Update Route
module.exports.updateListing = async (req, res) => {
    if(!req.body.listing){
        throw new ExpressError(400,"send valid data for listing");
    }
    let { id } = req.params;
      
      let updatedData = {...req.body.listing};
        let response = await geocoder.forwardGeocode({
        query: updatedData.location,
        limit: 1
    }).send();
     if (response.body.features.length > 0) {
        updatedData.geometry = response.body.features[0].geometry;
    }

    let listing = await Listing.findByIdAndUpdate(id,updatedData,{new:true});

     if(typeof req.file !== "undefined"){
        let url = req.file.path;
         let filename = req.file.filename;
    listing.image={url,filename};
    await listing.save();
     }
    
    req.flash("success", "Listing Updated!");
     return res.redirect("/listings");
};

// Delete Route
module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    if(listing.image && listing.image.filename){
        await cloudinary.uploader.destroy(listing.image.filename);
    }

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted!");
    return res.redirect("/listings");
};

