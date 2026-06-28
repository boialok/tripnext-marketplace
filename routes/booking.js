const Booking = require("../models/booking");
const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing");
const Razorpay = require("razorpay");
const nodemailer = require("nodemailer");

// Initialize Razorpay
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/", async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);

        // 1. Tell Razorpay to create a new order
        const options = {
            amount: listing.price * 100, // Razorpay also expects amounts in paise
            currency: "INR",
            receipt: `receipt_order_${id}`
        };

        const order = await instance.orders.create(options);

        // 2. Send the order details to a new checkout page
        res.render("listings/payment.ejs", { 
            listing, 
            order, 
            key_id: process.env.RAZORPAY_KEY_ID 
        });

    } catch (error) {
        console.error("Razorpay Error:", error);
        req.flash("error", "Something went wrong with the payment gateway!");
        res.redirect(`/listings/${req.params.id}`);
    }
});



router.post("/verify", async (req, res) => {
    try {
        const { id } = req.params;
        const { razorpay_payment_id } = req.body; // Sent by Razorpay on success
        const listing = await Listing.findById(id);

        // 1. Generate a random 6-digit Check-in OTP
        const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

        // 2. Save the Booking to the Database
        const newBooking = new Booking({
            listing: listing._id,
            author: req.user._id, // Assuming the user is logged in
            paymentId: razorpay_payment_id,
            totalPrice: listing.price,
            checkInOTP: generatedOTP
        });
        await newBooking.save();

const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"TripNext" <${process.env.EMAIL_USER}>`,
            to: req.user.email, // Sends to the currently logged-in user
            subject: "Booking Confirmed - TripNext",
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2 style="color: #fe424d;">Booking Confirmed!</h2>
                    <p>Hi ${req.user.username},</p>
                    <p>Your payment of <b>₹${listing.price}</b> was successful (Payment ID: ${razorpay_payment_id}).</p>
                    <p>You have successfully booked: <b>${listing.title}</b> in ${listing.location}.</p>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #fe424d; margin-top: 20px;">
                        <h3 style="margin-top: 0;">Your Check-in OTP:</h3>
                        <h1 style="letter-spacing: 5px; color: #333;">${generatedOTP}</h1>
                        <p style="margin-bottom: 0;">Please show this code to your host upon arrival.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        req.flash("success", "Payment successful! Receipt and OTP sent to your email.");
        res.redirect(`/listings/${id}`);

    } catch (error) {
        console.error("Verification Error:", error);
        req.flash("error", "Payment received, but failed to save booking. Please contact support.");
        res.redirect(`/listings/${req.params.id}`);
    }
});

module.exports = router;