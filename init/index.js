require("dotenv").config({ path: "../.env" });
const mongoose = require('mongoose'); 
const data = require('./data.js');
const Listing = require('../models/listing.js');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const User = require("../models/user");


const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

function formatCategory(category) {
    return category.toLowerCase().replace(/\s+/g, "_");
}

const MONGO_URL = process.env.ATLASDB_URL;
main()
    .then(() => {
        console.log("connected to db");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
     const user = await User.findOne();

    for(let obj of data.data){
        try{
            let response = await geocodingClient.forwardGeocode({
                query: obj.location,
                limit: 1,
            }).send();
            let geometry = null;

            if (response.body.features.length > 0) {
                geometry = response.body.features[0].geometry;
            }
           

            await Listing.create({
                ...obj,
                category: formatCategory(obj.category), 
                owner: user._id,
                geometry: geometry
            })

        }catch(err){
             console.log(`Error for ${obj.title}`, err.message);
        }
    }

    

    

    console.log("Database initialized with data");
};

initDB();