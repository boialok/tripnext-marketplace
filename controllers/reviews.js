const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id).populate("reviews");
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    
    listing.reviews.push(newReview);
    
    let sum = newReview.rating;
    for (let review of listing.reviews) {
        if (review._id.toString() !== newReview._id.toString()) {
            sum += review.rating;
        }
    }
    listing.averageRating = listing.reviews.length > 0 ? (sum / listing.reviews.length) : newReview.rating;

    await newReview.save();
    await listing.save();
    
    req.flash("success", "Review Added!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    
    await Review.findByIdAndDelete(reviewId);
    let listing = await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }, { new: true }).populate("reviews");
    
    if (listing.reviews.length > 0) {
        let sum = 0;
        for (let review of listing.reviews) {
            sum += review.rating;
        }
        listing.averageRating = sum / listing.reviews.length;
    } else {
        listing.averageRating = 0;
    }
    
    await listing.save();

    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};