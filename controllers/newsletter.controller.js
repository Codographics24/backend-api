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
      html: `
  <div style="font-family: 'Georgia', serif; background-color: #f0e6ff; padding: 40px; text-align: center;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 12px; overflow: hidden;">
      <img src="${process.env.BASE_URL}/public/images/welcome-banner.png" alt="Study desk" style="width: 100%; height: auto;">
      <div style="padding: 30px;">
        <h1 style="font-size: 28px; margin: 0 0 10px;">Welcome to Elara!</h1>
        <h2 style="font-size: 24px; margin: 0 0 20px; font-weight: normal;">Thanks for signing up!</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Hey there!<br />
          Thank you for signing up. We're so excited to have you on board!
          Elara was built for students just like you—ambitious, curious, and ready to make the most of every opportunity.
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          This is just the beginning, and we’re here to make sure you never miss what matters again.
        </p>
        <a href="${process.env.CLIENT_URL}" style="display: inline-block; margin-top: 20px; background-color: #a78bfa; color: white; padding: 12px 24px; border-radius: 24px; text-decoration: none; font-size: 16px;">
          SHOP NOW
        </a>
      </div>
    </div>
    <p style="margin-top: 40px; font-size: 14px; color: #555;">
      View more updates on our social media
    </p>
    <div style="margin-top: 10px;">
      <a href="https://instagram.com" style="margin: 0 8px;"><img src="https://cdn-icons-png.flaticon.com/24/1384/1384063.png" alt="Instagram" /></a>
      <a href="https://tiktok.com" style="margin: 0 8px;"><img src="https://cdn-icons-png.flaticon.com/24/3046/3046125.png" alt="TikTok" /></a>
      <a href="https://pinterest.com" style="margin: 0 8px;"><img src="https://cdn-icons-png.flaticon.com/24/2111/2111425.png" alt="Pinterest" /></a>
    </div>
    <p style="margin-top: 30px; font-size: 12px; color: #888;">
      Need help or have questions? Just reply to this email, we read everything ✨
    </p>
  </div>
`,
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
