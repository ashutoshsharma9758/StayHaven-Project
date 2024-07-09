const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const Listing= require("../models/listing.js");
// for autorization
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");


const listingController = require("../controllers/listings.js");

// for uploading images
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });


router.route("/")
.get( wrapAsync(listingController.index))
.post(isLoggedIn, upload.single('image') , validateListing, wrapAsync(listingController.createListing));



// new Route

router.get("/new",isLoggedIn , listingController.renderNewForm);

router.route("/:id")
.get( wrapAsync(listingController.showListing))
.put( isLoggedIn, isOwner, upload.single('image') ,validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// Index Route
router.get("/", wrapAsync(listingController.index));

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner,wrapAsync(listingController.renderEditForm));

router.post("/location",wrapAsync(listingController.findByLocation) );

// // Show Route or Read Route
// router.get("/:id", wrapAsync(listingController.showListing));

// // create Route
// router.post("/", isLoggedIn, validateListing, wrapAsync(listingController.createListing));



// // Update Route
// router.put("/:id", isLoggedIn, isOwner,validateListing, wrapAsync(listingController.updateListing));

// // Delete Route

// router.delete("/:id",isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;