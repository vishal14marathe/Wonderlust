const Listing = require("../models/listing");
const { listingSchema } = require("../schema.js");

module.exports.index = async(req, res) => {
    const allListings = await Listing.find({});
    // console.log(listing.price);
    res.render("listings/index.ejs", {allListings});
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {
      path: "author",
    }}).populate("owner");
    if(!listing) {
      req.flash("error", "Listing you requested for does not exist");
      res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", {listing});
}

module.exports.createListing = async(req, res, next) => {

    if (!req.body.listing.image || !req.body.listing.image.url) {
      req.body.listing.image = {
        url: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
      };
    }
    let result = listingSchema.validate(req.body);
    if(result.error) {
      throw new ExpressError(400, result.error);
    }
    let url = req.file.path;
    let filename = req.file.filename;
    
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}

module.exports.renderEditForm = async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
      req.flash("error", "Listing you requested for does not exist");
      res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250")
    res.render("listings/edit.ejs", { listing, originalImageUrl });
  
}

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
   
  // Update the listing with provided fields
  if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
  }

  // Use existing image if no new file is uploaded
  if (typeof req.file !== "undefined") {
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = { url, filename };
  }

  // Update other fields
  listing.set(req.body.listing);

  await listing.save();

  req.flash("success", "Listing Updated");
  res.redirect(`/listings/${id}`);
};



module.exports.destroyListing = async(req, res) => {
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}