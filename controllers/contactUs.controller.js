const ContactUs = require("../models/contactUs.model");
const { sendEmail } = require("../services/mail.service");

// Create a new Contact Us message
exports.createContactUs = async (req, res) => {
  const { name, email, message } = req.body;

  if (!message || message.length < 10) {
    return res
      .status(400)
      .json({ error: "Message must be at least 10 characters long." });
  }

  try {
    const contact = await ContactUs.create({ name, email, message });

    // Send confirmation to user
    await sendEmail({
      to: email,
      subject: "Thanks for contacting us!",
      text: `Hi ${name},\n\nThanks for reaching out. We'll get back to you shortly.`,
      html: `<p>Hi ${name},</p><p>Thanks for contacting us. We'll get back to you shortly.</p>`,
    });

    // Notify admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL, // Make sure this is set in .env
      subject: "New Contact Us Submission",
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `
        <h3>New Contact Us Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });

    res.status(201).json({
      message: "Message submitted successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Create contact us error:", error);
    res.status(500).json({ error: "Failed to submit message" });
  }
};

// Get all Contact Us messages
exports.getAllContactUs = async (req, res) => {
  try {
    const messages = await ContactUs.find().sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Get contact messages error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};
