const Listing = require("../models/listing");
const NodeGeocoder = require("node-geocoder");

const geoCoder = NodeGeocoder({
    provider: 'google',
    apiKey: process.env.MAP_API_KEY,
});

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
};
module.exports.searchListingsByCity = async (req, res) => {
    const cityKey = req.query.city;
    if (!cityKey) {
        req.flash("error", "City key is required.");
        return res.redirect("/listings");
    }
    const allListings = await Listing.find({
        "location.city": {
            $regex: new RegExp(cityKey, 'i')
        }
    });
    if (!allListings || allListings.length === 0) {
        req.flash("error", "No listings found for the specified city.");
        return res.redirect("/listings");
    }
    res.render("./listings/index.ejs", {
        allListings
    });
};
module.exports.renderNewForm = (req, res) => {
    res.render("./listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({
        path: "reviews",
        populate: {path: "author"}
    }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing you Requested for does not exist!!");
        res.redirect("/listings");
    }
    const address = `${listing.location.postalCode}${listing.location.city}${listing.location.state}${listing.location.country}`;
    const geoData = await geoCoder.geocode(address);
        const location = {
        lat: geoData[0].latitude,
        lng: geoData[0].longitude,
        formattedAddress: geoData[0].formattedAddress,}
    res.render("./listings/show.ejs", {listing,location});
};

module.exports.createListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {
        url,
        filename
    };
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("./listings");
};

module.exports.editListing = async (req, res) => {
    let {
        id
    } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you Requested for does not exist!!");
        res.redirect("/listings");
    }

    let orignalImageUrl = listing.image.url;
    orignalImageUrl = orignalImageUrl.replace("/upload", "/upload/w_250");

    res.render("listings/edit.ejs", {
        listing,
        orignalImageUrl
    });
};
module.exports.updateListing = async (req, res) => {
    let {
        id
    } = req.params;
    let newListing = await Listing.findByIdAndUpdate(id, {
        ...req.body.listing
    });
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        newListing.image = {
            url,
            filename
        };
    }
    await newListing.save();
    req.flash("success", "Listing Updated!");
    res.redirect("/listings");
}
module.exports.deleteListing = async (req, res) => {
    let {
        id
    } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};