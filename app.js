const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const http = require("http"); // To use with Socket.IO
const { Server } = require("socket.io"); // Import Socket.IO
require("dotenv").config(); // Load environment variables
require("./config/db.config"); // MongoDB connection config
const userRoutes = require("./routes/user.route");
const formRoutes = require("./routes/form.routes");

const app = express();
const server = http.createServer(app); // Create HTTP server
const PORT = process.env.PORT || 5000;

// Initialize Socket.IO with CORS settings
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(bodyParser.json());

// Routes
app.use("/api", userRoutes);
app.use("/api", formRoutes);

// Socket.IO integration
io.on("connection", (socket) => {
  console.log("A user connected with Socket.IO");

  // Hand off the socket instance to the controller for handling specific events
  socketController.handleConnection(socket, io);
});

// Start the server with Socket.IO
server.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});
