

const express = require('express');

const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const MONGO_URL ="mongodb://127.0.0.1:27017/wonderlust";
const path = require('path');
app.use(express.urlencoded({ extended: true }));
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate); ``
const { render } = require('ejs');
app.use(express.static(path.join(__dirname, '/public')));  
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const listingSchema = require('./schema.js');
main()
.then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.error(err);
});

async function main() {
    await mongoose.connect(MONGO_URL) ;
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.get('/', (req, res) => {
    res.send('Hello World!');
});
const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if (error) {
        let errmsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400,errmsg);
    } else {
        next();
    }
}
//index route
app.get("/listings", wrapAsync(async (req, res,next) => {
    const allListings = await Listing.find(); 
    res.render("listings/index", {allListings });
}));
// new route
app.get("/listings/new",  wrapAsync(async (req, res,next) => {
    res.render("listings/new.ejs");
}));
//show route
app.get("/listings/:id", wrapAsync(async (req, res,next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id); 
    res.render("listings/show", { listing });
}));

//create route

app.post("/listings", validateListing,
     wrapAsync(async (req, res, next) => {
const newListing = new Listing(req.body.listing); // ⬅️ सबसे पहले initialize करो

    await newListing.save();
    res.redirect('/listings'); // ⬅️ render की बजाय redirect करो
}));


//edit route
app.get("/listings/:id/edit", wrapAsync(async (req, res,next) => {     
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        // if (!listing) {
        //     return res.status(404).send("Listing not found");
        // }
        res.render("listings/edit.ejs", { listing });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading listing for edit");
    }
}));


//update rout
app.put("/listings/:id",validateListing
    ,wrapAsync(async (req, res,next) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
    res.redirect(`/listings/${listing._id}`);
}));

//delete route
app.delete("/listings/:id",  wrapAsync(async (req, res,next) => {
    const { id } = req.params;
   let deletedListing= await Listing.findByIdAndDelete(id);
   console.log(deletedListing);
    res.redirect("/listings");
}));


// app.get('/testListing',async (req, res) => {
// let listing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 10000,
//     location: "mumbai",
//     country: "india",
// });
// await samplelisting.save(); 

//     console.log("sample was saved to db");
//     res.send("successfully tested listing model");
// });




app.all("*", (req, res,next) => {
    next(new ExpressError("Page not found", 404));
}
);


app.use((err, req, res, next) => {
    let { statusCode=500, message="something went wrong!" } = err;
res.status(statusCode).render("error.ejs", {message});
      // res.status(statusCode).send(messazge);

   
});
 



app.listen(8080, () => {
    console.log("Server is running on port 8080");
});