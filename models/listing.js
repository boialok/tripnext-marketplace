const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        url: String,
        filename: String,
    },
    images: [
        {
            url: String,
            filename: String,
        }
    ],
    propertyType: {
        type: String,
        enum: ["Hotel", "Resort", "Farm house", "Beach house", "Complex", "Private room", "Room", "Home", "Villa", "Cabin", "Apartment"],
        default: "Home",
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    location: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ["Trending", "Rooms", "Iconic Cities", "Mountains", "Castles", "Amazing Pools", "Camping", "Farms", "Arctic", "Domes", "Boats"],
        required: true
    },
    maxGuests: {
        type: Number,
        required: true,
        min: 1 
    },
    bedrooms: {
        type: Number,
        required: true,
        min: 0
    },
    beds: {
        type: Number,
        required: true,
        min: 1
    },
    baths: {
        type: Number,
        required: true,
        min: 0
    },
    averageRating: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;