const Newsletter = require("../models/newsLetter.model");
const { sendEmail } = require("../services/mail.service");

// Subscribe to newsletter
exports.subscribeNewsletter = async (req, res) => {
  const { email } = req.body;

  try {
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already subscribed" });
    }

    const subscription = await Newsletter.create({ email });

    // Send confirmation to user
    await sendEmail({
      to: email,
      subject: "Thanks for subscribing to our newsletter!",
      text: `Hi,\n\nThanks for subscribing to our newsletter. Stay tuned for updates!`,
      html: `<p>Hi,</p><p>Thanks for subscribing to our newsletter. Stay tuned for updates!</p>`,
    });

    // Notify admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "New Newsletter Subscription",
      text: `New subscriber: ${email}`,
      html: `<p>New subscriber: <strong>${email}</strong></p>`,
    });

    res.status(201).json({
      message: "Subscribed successfully",
      data: subscription,
    });
  } catch (error) {
    console.error("Subscribe newsletter error:", error);
    res.status(500).json({ error: "Subscription failed" });
  }
};

// Get all newsletter subscribers
exports.getAllNewsletterSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });

    res.status(200).json(subscribers);
  } catch (error) {
    console.error("Get newsletter subscribers error:", error);
    res.status(500).json({ error: "Failed to fetch subscribers" });
  }
};
