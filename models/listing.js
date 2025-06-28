const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Review  = require("./review.js")


const listingSchema = new Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    image:{
        url:String,
        filename:String,
    },
    price:Number,
    location:String,
    country:String,
    category: {
    type: String,
    required: true,
    enum: [
      "Rooms",
      "Iconic cities",
      "Mountains",
      "Castles",
      "Pools",
      "Camping",
      "Farms",
      "Arctic",
      "Beachside",
    ],
  },
    geometry: {
    type: {
      type: String,
      enum: ['Point'], // Must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
    reviews:[
        {
        type:Schema.Types.ObjectId,
        ref:"Review",
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    }
})

//handling deleteion
listingSchema.post("findOneAndDelete", async(listing)=>{
    if(listing){
        await Review.deleteMany({reviews:{$in: listing.reviews}})
    }
    
})



const Listing  = mongoose.model("Listing", listingSchema);
module.exports = Listing;