const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const { isLoggedIn, saveRedirectUrl } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const userController = require("../controllers/users.js");
const Booking = require("../models/booking.js");
const Listing = require("../models/listing");

router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup));

router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: '/login',
      failureFlash: true
    }),
    userController.login
  );

router.get("/logout", userController.logout);


router.get("/my-bookings", async (req, res) => {
    // Check if user is logged in
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in to view your bookings.");
        return res.redirect("/login");
    }

    try {
        // Find all bookings for this user and populate the associated listing details
        const bookings = await Booking.find({ author: req.user._id })
            .populate("listing")
            .sort({ createdAt: -1 }); // Sort by newest first

        res.render("users/bookings.ejs", { bookings });
    } catch (error) {
        console.error(error);
        req.flash("error", "Could not fetch your bookings.");
        res.redirect("/listings");
    }
});

// Detailed Receipt Route
router.get("/my-bookings/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in to view your receipts.");
        return res.redirect("/login");
    }

    try {
        const { id } = req.params;
        
        // Find the booking and populate both the listing and the author
        const booking = await Booking.findById(id)
            .populate("listing")
            .populate("author");

        if (!booking) {
            req.flash("error", "Booking not found.");
            return res.redirect("/my-bookings");
        }

        // SECURITY: Ensure the logged-in user actually owns this booking
        if (!booking.author._id.equals(req.user._id)) {
            req.flash("error", "You do not have permission to view this receipt.");
            return res.redirect("/my-bookings");
        }

        res.render("users/receipt.ejs", { booking });
        
    } catch (error) {
        console.error(error);
        req.flash("error", "Could not fetch the receipt.");
        res.redirect("/my-bookings");
    }
});
router.get("/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in to view your profile.");
        return res.redirect("/login");
    }

    try {
        const myListings = await Listing.find({ owner: req.user._id });
        res.render("users/profile.ejs", { myListings });
    } catch (error) {
        req.flash("error", "Could not load your profile dashboard.");
        res.redirect("/listings");
    }
});

router.get("/wishlist", isLoggedIn, wrapAsync(async (req, res) => {
    let user = await User.findById(req.user._id).populate("wishlist");
    res.render("users/wishlist.ejs", { wishlist: user.wishlist });
}));

// 2. Toggle Heart Button (Add/Remove Listing)
router.post("/wishlist/:listingId", isLoggedIn, wrapAsync(async (req, res) => {
    const { listingId } = req.params;
    const user = await User.findById(req.user._id);

    // Check if the property is already in the array
    if (user.wishlist.includes(listingId)) {
        user.wishlist.pull(listingId);
        req.flash("success", "Removed from Wishlist");
    } else {
        user.wishlist.push(listingId);
        req.flash("success", "Added to Wishlist");
    }
    
    await user.save();
     let redirectUrl = req.get("Referer") || "/listings";
    res.redirect(redirectUrl);  // Reloads the page so the heart changes color
}));

router.get("/account", isLoggedIn, (req, res) => {
    res.render("users/account.ejs");
});

// 2. Host Bookings (See who booked your properties)
router.get("/host-bookings", isLoggedIn, wrapAsync(async (req, res) => {
    // Step A: Find all listings owned by the logged-in Host
    const myListings = await Listing.find({ owner: req.user._id });
    
    // Extract just the IDs of those listings
    const listingIds = myListings.map(listing => listing._id);

    // Step B: Find all bookings made on ANY of those specific listings
    const hostBookings = await Booking.find({ listing: { $in: listingIds } })
        .populate("listing")
        .populate("author") // We populate the author to see the GUEST's details
        .sort({ createdAt: -1 }); // Sort by newest first

    res.render("users/host-bookings.ejs", { hostBookings });
}));

module.exports = router;