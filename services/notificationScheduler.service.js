const cron = require("node-cron");
const admin = require("../config/firebase");

// Helper to send a push notification
const sendNotification = async (token, title, body) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      token,
    };

    await admin.messaging().send(message);
    console.log(`✅ Notification sent to token: ${token}`);
  } catch (error) {
    console.error("❌ Error sending notification:", error);
  }
};

// Map frequency to cron pattern
const frequencyToCron = {
  "Low Orbit": "0 10 * * 1,4", // Mon & Thu @10am
  "Lunar Drift": "0 10 */3 * *", // Every 3 days @10am
  Hyperdrive: "0 10 * * *", // Daily @10am
  Custom: null, // Define dynamically if needed
};

// Main scheduler
const scheduleReminder = (reminder) => {
  const { frequency, title, date, reminderType, fcmToken } = reminder;

  const cronPattern = frequencyToCron[frequency];

  if (!cronPattern) {
    console.warn("⚠️ Custom frequency not supported yet.");
    return;
  }

  cron.schedule(cronPattern, () => {
    const today = new Date();
    const reminderDate = new Date(date);

    // Optional: skip if date has passed
    if (today > reminderDate) return;

    sendNotification(
      fcmToken,
      `⏰ Cosmic Reminder: ${title}`,
      `Don't forget your ${reminderType}!`
    );
  });

  console.log(`🪐 Scheduled reminder '${title}' for frequency '${frequency}'`);
};

module.exports = {
  scheduleReminder,
};
