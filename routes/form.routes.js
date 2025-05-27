const express = require("express");
const router = express.Router();
const contactUsController = require("../controllers/contactUs.controller");
const newsLetterController = require("../controllers/newsletter.controller");
const { authenticateJWT } = require("../middlewares/auth.middleware");

// Newsletter Routes
router.post("/newsletter/subscribe", newsLetterController.subscribeNewsletter);
router.get(
  "/newsletter",
  authenticateJWT,
  newsLetterController.getAllNewsletterSubscribers
);

// Contact Us Routes
router.post("/contact-us", contactUsController.createContactUs);
router.get("/contact-us", authenticateJWT, contactUsController.getAllContactUs);

module.exports = router;
