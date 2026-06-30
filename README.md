# TripNext 🌍✈️
> A full-stack, two-sided marketplace for discovering and hosting unique travel accommodations around the world.

**[Live](https://tripnext-or29.onrender.com)**

TripNext is a robust, production-ready web application built with Node.js, Express, and MongoDB. It allows users to seamlessly switch between "Traveling" and "Hosting" modes, empowering them to list their own properties, explore global destinations, save favorites to a wishlist, and securely book stays using an integrated payment gateway.

---

## ✨ Key Features
* **Two-Sided Marketplace:** Seamlessly toggle between Host and Traveler profiles.
* **Secure Authentication:** User signup, login, and encrypted session management using Passport.js.
* **Payment Integration:** Secure checkout and booking confirmation using the Razorpay API.
* **Dynamic Search & Filtering:** Filter properties by category (Mountains, Castles, Amazing Pools, etc.) and search by location.
* **Cloud Architecture:** Fully deployed on Render with a cloud-hosted MongoDB Atlas database.
* **Responsive UI:** A mobile-first, heavily customized interface utilizing Bootstrap and EJS templating.

---

## 🛠️ Tech Stack
**Frontend:**
* HTML5 / CSS3 / JavaScript
* EJS (Embedded JavaScript templates) with `ejs-mate`
* Bootstrap 5 (Responsive Layout & UI Components)

**Backend:**
* Node.js & Express.js
* RESTful API Architecture
* Passport.js (Local Authentication)
* Express-Session & Connect-Flash (State Management)

**Database & Cloud:**
* MongoDB Atlas
* Mongoose (ODM)
* Render (Hosting & CI/CD Pipeline)

**External APIs:**
* Razorpay API (Payment Processing)
* Map/Cloudinary APIs (Location & Image Storage)

---

## 🚀 Local Installation

1. **Clone the repository**
```bash
git clone [https://github.com/your-username/tripnext-marketplace.git](https://github.com/your-username/tripnext-marketplace.git)
cd tripnext-marketplace
