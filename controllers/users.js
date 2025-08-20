const User = require("../models/user");
const nodemailer = require("nodemailer");


// Signup form render
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

// Signup logic
module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);

            req.flash("success", "Welcome to the app!");
            return res.redirect("/listings");
        });

    } catch (e) {
        req.flash("error", e.message);
        return res.redirect("/signup");
    }
};

// Login form render
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

// Login logic
module.exports.login = (req, res) => {
    req.flash("success", "Welcome back!");
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

// Logout logic
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);

        req.flash("success", "Goodbye!");
        res.redirect("/listings");
    });
};
