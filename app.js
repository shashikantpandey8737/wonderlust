if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();  
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const LocalStrategy = require('passport-local');

// Models
const User = require('./models/user.js');

// Routes
const ListingRouter = require('./routes/listing.js');
const reviewRouter = require('./routes/review.js');
const userRouter = require('./routes/user.js');

// Utils
const ExpressError = require('./utils/ExpressError.js');

const dburl = process.env.ATLASDB_URL;

// 🔹 MongoDB Connection
main()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error(err));

async function main() {
  await mongoose.connect(dburl);
}

// 🔹 View Engine Setup
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 🔹 Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '/public')));

// 🔹 Mongo Session Store
const store = MongoStore.create({
  mongoUrl: dburl,
  crypto: { secret: process.env.SECRET },
  touchAfter: 24 * 3600, // time in seconds
});

store.on('error', (e) => {
  console.log('Session store error', e);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET || 'fallbacksecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    maxAge: 1000 * 60 * 60 * 24 * 7,
  }
};

app.use(session(sessionOptions));
app.use(flash());

// 🔹 Passport Auth
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// 🔹 Flash & Current User Middleware
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// 🔹 Routes
app.use('/listings', ListingRouter);
app.use('/listings/:id/reviews', reviewRouter);
app.use('/', userRouter);   // ✅ user routes -> login, signup, forgot-password

// 🔹 Home Route
app.get('/', (req, res) => {
  res.render('home');
});

// 🔹 Error Handling
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render('error', { message });
});

// 🔹 Server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});




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