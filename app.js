if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();  
}
const session = require('express-session');
const MongoStore = require('connect-mongo');


const express = require('express');

const app = express();
const mongoose = require('mongoose');

const dburl = process.env.ATLASDB_URL;


const path = require('path');
app.use(express.urlencoded({ extended: true }));
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate); ``
const { render } = require('ejs');
app.use(express.static(path.join(__dirname, '/public')));  
const ExpressError = require('./utils/ExpressError.js');
const { listingSchema, reviewSchema } = require('./schema.js');
const ListingRouter = require('./routes/listing.js');
const reviewRouter = require('./routes/review.js');
const userRouter = require('./routes/user.js');






const LocalStrategy = require('passport-local');

const flash = require('connect-flash');
const passport = require('passport');
const User = require('./models/user.js');


const Review = require('./models/review.js');
main()
.then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.error(err);
});

async function main() {
    await mongoose.connect(dburl) ;
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// app.get('/', (req, res) => {
//     res.send('Hello World!');
// });
const store = MongoStore.create({
    mongoUrl: dburl,
    crypto: {
        secret: process.env.SECRET ,
    },
    touchAfter: 24 * 3600, // time in seconds

});
// GET Forgot Password page
app.get("/forgot-password", (req, res) => {
  res.render("users/forgot-password"); 
});

// POST Forgot Password form
app.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  // Yaha pe apni reset-password logic likho
  console.log("Reset link send to:", email);
  res.send("Reset link has been sent to your email!");
});



store.on('error', function (e) {
    console.log('Session store error', e);
}
);

const sessionOptions = {
    store: store,
    secret:  process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
    }
}   ;





app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())   );

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.currUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// app.get("/demouser",async (req, res) => {
//     let fakeUser =new User( {
//        email:"shashikant@gmail.com",
//          username:"shashikant",
//     })

//     let registeredUser = await User.register(fakeUser,  "hello123");
// //  let registeredUser = await user.register(fakeUser,  "hello123");
//  res.send(registeredUser);

// });



app.use('/listings', ListingRouter);
app.use('/listings/:id/reviews', reviewRouter);
app.use('/', userRouter);


app.all("*", (req, res,next) => {
    next(new ExpressError("Page not found", 404));
}
);
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    if (typeof err !== "object") {
        err = { statusCode: 500, message: String(err) };
    }
    let statusCode = err.statusCode || 500;
    if (typeof statusCode !== "number") statusCode = 500;
    let message = err.message || "something went wrong!";
    res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});