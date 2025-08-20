if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Models
const User = require("./models/user.js");

// Routes
const ListingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// Utils
const ExpressError = require("./utils/ExpressError.js");

// 🔹 MongoDB Connection
const dburl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/myapp";

mongoose.connect(dburl)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// 🔹 View Engine Setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 🔹 Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// 🔹 Session Store
const store = MongoStore.create({
    mongoUrl: dburl,
    crypto: { secret: process.env.SECRET || "fallbacksecret" },
    touchAfter: 24 * 3600
});
store.on("error", (e) => console.log("Session store error:", e));

app.use(session({
    store,
    secret: process.env.SECRET || "fallbacksecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

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
    res.locals.redirectUrl = req.session.redirectUrl || '/listings';
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


// 🔹 Routes
app.use("/listings", ListingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// 🔹 Home Route
app.get("/", (req, res) => {
    res.render("show");
});

// 🔹 404 Error
app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

// 🔹 Global Error Handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error", { message });
});

// 🔹 Server
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
