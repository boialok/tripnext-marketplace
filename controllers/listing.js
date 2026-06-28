const Listing = require("../models/listing");
const User = require("../models/user");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    
    const groupedListings = allListings.reduce((acc, listing) => {
        if (listing.location) {
            const city = listing.location.split(',')[0].trim();
            if (!acc[city]) acc[city] = [];
            acc[city].push(listing);
        }
        return acc;
    }, {});
    res.render("listings/index.ejs", { 
        groupedListings, 
        allListings: null, 
        city: null,
        category: null 
    });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");
    
    if (!listing) {
        req.flash("error", "Listing you looked for does not exist!");
        return res.redirect("/listings");
    }

    if (req.query.canceled) {
        req.flash("error", "Payment canceled. You have not been charged.");
    }

    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    if (req.files && req.files.length > 0) {
        newListing.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    }

    await newListing.save();
    req.flash("success", "New Listing Added!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Requested listing Does not Exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = "";
    if (listing.images && listing.images.length > 0) {
        originalImageUrl = listing.images[0].url.replace("/upload", "/upload/h_300,w_250");
    } else if (listing.image && listing.image.url) {
        originalImageUrl = listing.image.url.replace("/upload", "/upload/h_300,w_250");
    }

    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (req.files && req.files.length > 0) {
        let newImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
        listing.images.push(...newImages);
        await listing.save();
    }
    
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};

module.exports.toggleWishlist = async (req, res) => {
    const { id } = req.params;
    let user = await User.findById(req.user._id);

    if (!user.wishlist) {
        user.wishlist = [];
    }

    let added = false;
    if (user.wishlist.includes(id)) {
        user.wishlist.pull(id);
    } else {
        user.wishlist.push(id);
        added = true;
    }

    await user.save();
    res.json({ added });
};

module.exports.filterByCity = async (req, res) => {
    const { city, category, guests } = req.query;
    let allListings = [];

    if (guests && !city && !category) {
        req.flash("error", "Please provide the place name!");
        return res.redirect("/listings");
    }

    if (city) {
        const flexibleSearch = city.replace(/\s+/g, '').split('').join('\\s*');
        
        allListings = await Listing.find({ 
            location: { $regex: flexibleSearch, $options: 'i' } 
        });
    } else if (category === 'Trending') {
        allListings = await Listing.find({ averageRating: { $gt: 4 } });
    } else if (category) {
        allListings = await Listing.find({ 
            category: category 
        });
    }

    if (allListings.length === 0) {
        if (city) {
            req.flash("error", `No Listings Available for ${city}!`);
        } else {
            req.flash("error", "No Listings Available in This category..!");
        }
        return res.redirect("/listings");
    }

    res.render("listings/index.ejs", { 
        allListings, 
        groupedListings: null, 
        city: city || null, 
        category: category || null 
    });
};