const fetch = require("node-fetch");
const Listing = require("../models/listing")
const {listingSchema} = require("../schema")

module.exports.index = async (req, res) => {
  const { category } = req.query;
  let listings;

  if (category) {
    listings = await Listing.find({ category });
  } else {
    listings = await Listing.find({});
  }

  res.render("listings/index.ejs", { listings, category });
};
module.exports.searchListings = async (req, res) => {
    const query = req.query.q;

    if (!query || query.trim() === "") {
        req.flash("error", "Please enter a valid search term.");
        return res.redirect("/listings");
    }

    const listings = await Listing.find({
        location: { $regex: query, $options: "i" }  // case-insensitive match
    });

    res.render("listings/index", { listings,category:null });
};


module.exports.rendernewForm = (req,res)=>{
    res.render("listings/new.ejs")
}
module.exports.showListing = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({   
        path:"reviews",
        populate:{
            path:"author",
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist")
        res.redirect("/listings")
    }
    res.render("listings/show.ejs",{listing})
}

module.exports.createListing = async (req, res) => {
  try {
    const { listing } = req.body;

    // Step 1: Geocode the user input using Nominatim
    const geoResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(listing.location)}`,
      {
        headers: {
          "User-Agent": "WanderLustApp/1.0" // required by Nominatim
        }
      }
    );
    const geoData = await geoResponse.json();

    if (!geoData.length) {
      req.flash("error", "Invalid location. Please try again.");
      return res.redirect("/listings/new");
    }

    const { lat, lon } = geoData[0]; //etiki

    let url = req.file.path;
    let filename = req.file.filename;
    // console.log(req.file)
    let result = listingSchema.validate(req.body)
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = { //eithu
      type: "Point",
      coordinates: [parseFloat(lon), parseFloat(lat)]
    };  //etiki

    await newListing.save();

    req.flash("success", "New Listing Added Successfully");
    console.log("Location:", newListing.location);
console.log("Coordinates:", newListing.geometry.coordinates);
console.log("category",newListing.category)
    res.redirect("/listings");

  } catch (err) {
    console.error("Error creating listing:", err);
    req.flash("error", "Something went wrong.");
    res.redirect("/listings/new");
  }
};


module.exports.editListing = async (req,res)=>{
    let{id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist")
        res.redirect("/listings")
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/h_200,w_250")
    res.render("listings/edit.ejs",{listing, originalImageUrl})
}
module.exports.updateListing = async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename}
    await listing.save();
    }
    req.flash("success"," Listing Updated Successfully")
    res.redirect(`/listings/${id}`);
    
}
module.exports.deleteListing=async(req,res)=>{
    let{id} = req.params;
    let deletedListing = await Listing.findOneAndDelete(id);
    console.log(deletedListing);
    req.flash("success"," Listing Delted Successfully")
    res.redirect("/listings");
}





// module.exports.index = async (req,res)=>{
//    const allListings= await Listing.find({});
//    const {category} = req.query;
//    let listingsfilter;
//    if(category){
//       listingsfilter = await Listing.find({category})
//    }
//    else{
//     await Listing.find({});
//    }
//    res.render("listings/index.ejs",{allListings,category});
// }