const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        propertyType: Joi.string().valid("Hotel", "Resort", "Farm house", "Beach house", "Complex", "Private room", "Room", "Home", "Villa", "Cabin", "Apartment").required(),
        category: Joi.string().valid("Trending", "Rooms", "Iconic Cities", "Mountains", "Castles", "Amazing Pools", "Camping", "Farms", "Arctic", "Domes", "Boats").required(),
        maxGuests: Joi.number().required().min(1),
        bedrooms: Joi.number().required().min(0),
        beds: Joi.number().required().min(1),
        baths: Joi.number().required().min(0)
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required()
});