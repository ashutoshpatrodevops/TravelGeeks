if(process.env.NODE_ENV!="production"){
  require('dotenv').config()
}

// console.log(process.env.SECRET) // remove this after you've confirmed it is working

const express = require('express')
const app = express();
const mongoose = require('mongoose')
// const Listing = require('./models/listing')
const path = require("path");
const methodOverride = require('method-override');
// const wrapAsync = require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpressError.js")
const session = require("express-session");
const MongoStore = require("connect-mongo")
const flash = require("connect-flash")
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// const {listingSchema, reviewSchema} = require("./schema.js")
// const Review = require('./models/review.js')
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"))
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
const ejsMate = require("ejs-mate");

app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")))

const listingsRouter= require("./routes/listing.js")
const reviewsRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")

const dbUrl = process.env.ATLASURL;

async function main() {
  await mongoose.connect(dbUrl);
}
main()
.then(()=>
    {console.log("database is connected")}
)
.catch(err => console.log(err));

const store = MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:process.env.SECRET
  },
  touchAfter:24*3600
})
store.on("error",(err)=>{
  console.log("error in mongo session store",err)
})


const sessionOptions = {
  store,
    secret:process.env.SECRET,
    resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now() + 7 * 24 * 60 *60*1000,
    maxAge:7 * 24 * 60 *60*1000,
    httpOnly:true,
  }
};




app.use(session(sessionOptions));
app.use(flash())

app.use(passport.initialize())
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.get("/",(req,res)=>{
//     res.send("Root route");
// })
// const validateListinng = (req,res,next)=>{
//     let {error} = listingSchema.validate(req.body)

//     if(error){
//         let errmsg = error.details.map((el)=>el.message).join(",");
//         throw new ExpressError(400, errmsg);
//     }else{
//         next();
//     }
// }
// const validateReview = (req,res,next)=>{
//     let {error} = reviewSchema.validate(req.body)
//     if(error){
//         let errmsg = error.details.map((el)=>el.message).join(",");
//         throw new ExpressError(400,errmsg);
//     }else{
//         next();
//     }
// }


// app.get("/listings",wrapAsync(async (req,res)=>{
//    const allListings= await Listing.find({});
//    res.render("listings/index.ejs",{allListings});
// }));

//new route
// app.get("/listings/new",(req,res)=>{
//     res.render("listings/new.ejs")
// })
//show route
// app.get("/listings/:id",wrapAsync(async(req,res)=>{
//     let {id} = req.params;
//     const listing = await Listing.findById(id).populate("reviews");
//     res.render("listings/show.ejs",{listing})
// }));

//create route
// app.post("/listings",validateListinng, wrapAsync(async(req,res)=>{
//     let result = listingSchema.validate(req.body)
//     newListing = new Listing(req.body.listing);
//     await newListing.save();
//     res.redirect("/listings")
// }));
//edit route
// app.get("/listings/:id/edit", wrapAsync(async (req,res)=>{
//     let{id} = req.params;
//     const listing = await Listing.findById(id);
//     res.render("listings/edit.ejs",{listing})
// }));

// update route
// app.put("/listings/:id",validateListinng,  wrapAsync(async (req,res)=>{
//     let {id} = req.params;
//     await Listing.findByIdAndUpdate(id, {...req.body.listing});
//     res.redirect(`/listings/${id}`);
// }));
// delete route
// app.delete("/listings/:id",wrapAsync(async(req,res)=>{
//     let{id} = req.params;
//     let deletedListing = await Listing.findOneAndDelete(id);
//     console.log(deletedListing);
//     res.redirect("/listings");
// }));
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error")
    res.locals.currUser = req.user
    next();
})

//fake user
// app.get("/demouser",async (req,res)=>{
//   let fakeUser = new User({
//     email:"student@gmail.com",
//     username:"student"
//   });
//   let registeredUser = await User.register(fakeUser,"hello");
//   res.send(registeredUser);
// }) 

app.use("/listings",listingsRouter)
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);

//reviews
//post route
// app.post("/listings/:id/reviews", validateReview,wrapAsync(async(req,res)=>{
//     let listing = await Listing.findById(req.params.id);
//     let newReview = new Review(req.body.review);

//     listing.reviews.push(newReview);

//     await newReview.save();
//     await listing.save();
//     res.redirect(`/listings/${listing._id}`)
// }))

// delete review route
// app.delete("/listings/:id/:reviews/:reviewId", wrapAsync(async(req,res)=>{
//     let {id, reviewId} = req.params;
//     await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
//     await Review.findById(reviewId)

//     res.redirect(`/listings/${id}`)
// }))

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500, message="something went wrong"} = err;
    res.render("listings/error.ejs",{message});
    // res.status(statusCode).send(message);
})

if (process.env.NODE_ENV !== "production") {
  app.listen(process.env.PORT || 8080, () => {
    console.log(`server is listening on port ${process.env.PORT || 8080}`);
  });
}

module.exports = app;
