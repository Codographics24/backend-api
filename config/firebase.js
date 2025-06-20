const admin = require("firebase-admin");
const serviceAccount = require("../elara-51540-firebase-adminsdk-fbsvc-180aefcdcb.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
