const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing, isAdmin} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");

const upload = multer({ storage});

router.route("/")
.get(wrapAsync(listingController.index))
.post(
  isOwner,
  isLoggedIn,
  upload.single('listing[image]'),
  wrapAsync(listingController.createListing)
);

//new route
router.get("/new", isLoggedIn, listingController.renderNewForm);


router.route("/:id")
.get( wrapAsync(listingController.showListing))
.put(isLoggedIn,
  isOwner,
  upload.single('listing[image]'),
  validateListing,
  wrapAsync(listingController.updateListing)
)
.delete( isLoggedIn,
    isAdmin || isOwner,
  wrapAsync(listingController.destroyListing)
);


//edit route
router.get("/:id/edit", isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm));


module.exports = router;