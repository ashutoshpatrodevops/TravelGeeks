const express = require('express')
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js")

// const Review = require('../models/review.js')
const Listing = require('../models/listing')
const {isLoggedIn, isOwner, validateListinng} = require("../middleware.js")
const listingController = require("../controllers/listings.js")
const multer  = require('multer')
const {storage} = require("../CloudConfig.js")
const upload = multer({ storage })

router.get("/search", wrapAsync(listingController.searchListings));

router
.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn, upload.single("listing[image]"),validateListinng,wrapAsync(listingController.createListing)

);
    
//new route
router.get("/new",isLoggedIn, listingController.rendernewForm)

router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn,isOwner,upload.single("listing[image]"),validateListinng,  wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner,wrapAsync(listingController.deleteListing))

// router.get("/",listingController.index);


//show route
// router.get("/:id",wrapAsync(listingController.showListing));

//create route
// router.post("/",validateListinng,isLoggedIn, wrapAsync(listingController.createListing));    
//edit route
router.get("/:id/edit", isLoggedIn,isOwner,wrapAsync(listingController.editListing));

// update route
// router.put("/:id",isLoggedIn,isOwner,validateListinng,  wrapAsync(listingController.updateListing));
// delete route
// router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.deleteListing));

module.exports = router;