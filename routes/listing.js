const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {
    isLoggedIn,
    isOwner,
    validateListing
} = require("../middleware.js");
const {
    index,
    renderNewForm,
    showListing,
    createListing,
    editListing,
    updateListing,
    deleteListing,
    searchListingsByCity
} = require("../controllers/listingcontro.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

router
    .route("/")
    .get(wrapAsync(index))
    .post(isLoggedIn,upload.single("url"),validateListing, wrapAsync(createListing));

router.get("/new", isLoggedIn, renderNewForm);
router.get("/search", searchListingsByCity);

router
    .route("/:id")
    .get(wrapAsync(showListing))
    .put(isLoggedIn, isOwner,upload.single("url"), validateListing, wrapAsync(updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(deleteListing));


router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(editListing));

module.exports = router;