const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const wrapAsync = require('../utils/wrapAsync.js');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');
const usersController = require('../controllers/users.js');

const nodemailer = require('nodemailer');
const crypto = require('crypto');

// --- Signup ---
router.route("/signup")
    .get(wrapAsync(usersController.renderSignupForm))
    .post(wrapAsync(usersController.signup));

// --- Login ---
router.route("/login")
    .get(wrapAsync(usersController.renderLoginForm))
    .post(
        saveRedirectUrl,
        passport.authenticate(
            'local',
            { failureFlash: true, failureRedirect: '/login' }
        ),
        usersController.login
    );

// --- Logout ---
router.get('/logout', usersController.logout);

// --- Forgot Password Form ---
router.get('/forgot-password', (req, res) => {
    res.render('users/forgot-password');
});

// --- Forgot Password Submit ---
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('success', 'If this email exists, a reset link will be sent.');
            return res.redirect('/login');
        }

        // ✅ Generate token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Save token + expiry in DB
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Reset link
        const resetLink = `http://localhost:8080/reset-password/${resetToken}`;

        // Send email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: user.email,
            subject: 'Password Reset',
            text: `Click here to reset your password: ${resetLink}`
        };

        await transporter.sendMail(mailOptions);

        req.flash('success', 'Check your email for a reset link.');
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Something went wrong.');
        res.redirect('/forgot-password');
    }
});

// --- Reset Password Form ---
router.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        req.flash('error', 'Token is invalid or expired.');
        return res.redirect('/forgot-password');
    }

    res.render('users/reset-password', { token });
});

// --- Reset Password Submit ---
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        req.flash('error', 'Token is invalid or expired.');
        return res.redirect('/forgot-password');
    }

    await user.setPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    req.flash('success', 'Password reset successful. You can now login.');
    res.redirect('/login');
});

module.exports = router;
