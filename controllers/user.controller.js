const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/user.model");
const crypto = require("crypto");
const { sendEmail } = require("../services/mail.service");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Login or Register (Apple or Email)
exports.loginOrRegister = async (req, res) => {
  const { appleId, email, name, phone, username } = req.body;

  try {
    let user = await User.findOne({
      $or: [{ email }, { appleId }],
      deleted: false,
    });

    if (user) {
      if (appleId && user.appleId !== appleId) {
        user.appleId = appleId;
        await user.save();
      }
    } else {
      let softDeletedUser = await User.findOne({ email, deleted: true });

      if (softDeletedUser) {
        softDeletedUser.deleted = false;
        softDeletedUser.deletedAt = null;
        if (appleId && softDeletedUser.appleId !== appleId) {
          softDeletedUser.appleId = appleId;
        }
        user = await softDeletedUser.save();
      } else {
        user = await User.create({
          appleId,
          email,
          name,
          phone,
          username,
        });
      }
    }

    const token = jwt.sign(
      { userId: user._id, appleId: user.appleId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        appleId: user.appleId,
      },
    });
  } catch (error) {
    console.error("Login/Register error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
};

// Admin Register
exports.adminRegister = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    res.status(201).json({
      message: "Admin registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin registration error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Admin Login
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Google Register/Login
exports.googleAuth = async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        authSource: "google",
        profilePicture: picture,
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Google Auth error:", error);
    res.status(400).json({ error: "Google authentication failed" });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, username, phone, country, timezone, device } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Update basic profile fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.phone = phone || user.phone;
    user.country = country || user.country;
    user.timezone = timezone || user.timezone;

    // Device update logic (optional)
    if (device?.deviceName && device?.os) {
      const existingDevice = user.devices.find(
        (d) => d.deviceName === device.deviceName && d.os === device.os
      );

      if (existingDevice) {
        // Update lastAccess if device already exists
        existingDevice.lastAccess = new Date(device.lastAccess || Date.now());
      } else {
        // Add new device
        user.devices.push({
          deviceName: device.deviceName,
          os: device.os,
          lastAccess: device.lastAccess || new Date(),
        });
      }
    }

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        country: user.country,
        timezone: user.timezone,
        devices: user.devices,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

// Soft Delete User
exports.softDeleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.deleted = true;
    user.deletedAt = new Date();
    await user.save();

    res.status(200).json({ message: "User soft-deleted successfully" });
  } catch (error) {
    console.error("Soft delete error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// Permanently Delete User
exports.hardDeleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted permanently" });
  } catch (error) {
    console.error("Hard delete error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// Get All Users (excluding deleted)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ deleted: false });
    res.status(200).json(users);
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Get User by ID
exports.getUserDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).populate(
      "devices",
      "-_id deviceName os lastAccess"
    );
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Fetch user details error:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
};

// Step 1: Verify Email & Send OTP
exports.verifyEmail = async (req, res) => {
  const { email, name } = req.body;

  try {
    const existingUser = await User.findOne({
      email,
      deleted: false,
      isVerified: true,
    });

    if (existingUser) {
      const profileComplete = !!existingUser.name;
      return res.status(400).json({
        error: "Email already exists",
        profileComplete,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await sendEmail({
      to: email,
      subject: "Your Verification Code",
      html: `
             <p>Your verification code is: <b>${otp}</b></p>
             <p>This code will expire in 10 minutes.</p>`,
    });

    let user = await User.findOne({ email, deleted: true, isVerified: false });
    if (user) {
      user.otp = otp;
      user.otpExpires = otpExpires;
      user.deleted = false;
      user.deletedAt = null;
      await user.save();
    } else {
      user = await User.create({
        email,
        name: name,
        otp,
        otpExpires,
        isVerified: false,
        authSource: "self",
      });
    }

    return res.status(200).json({ message: "Verification code sent" });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({ error: "Failed to send verification code" });
  }
};

// Step 2: Verify OTP and Mark as Verified
exports.verifyOtpCode = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email, deleted: false }).select(
      "+otp +otpExpires"
    );

    if (!user || user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: "User verified successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({ error: "OTP verification failed" });
  }
};

// Continue Signup (complete registration with name, username, password)
exports.continueSignup = async (req, res) => {
  const { id } = req.params;
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res
      .status(400)
      .json({ error: "Name, username, and password are required" });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if username is already taken by another user
    const existingUsername = await User.findOne({
      username: username.toLowerCase(),
      _id: { $ne: id },
    });
    if (existingUsername) {
      return res.status(409).json({ error: "Username already taken" });
    }

    // Update fields
    user.name = name;
    user.username = username.toLowerCase();
    user.password = await bcrypt.hash(password, 10); // Hash the password

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Signup completed and logged in successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Continue signup error:", error);
    res.status(500).json({ error: "Failed to complete signup" });
  }
};

// Step 3: Login With Email/Password
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, deleted: false }).select(
      "+password"
    );

    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Login user error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// Check if username exists
exports.checkUsernameExists = async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const user = await User.findOne({
      username: username.toLowerCase().trim(),
    });

    if (user) {
      return res
        .status(200)
        .json({ exists: true, message: "Username already taken" });
    } else {
      return res
        .status(200)
        .json({ exists: false, message: "Username is available" });
    }
  } catch (error) {
    console.error("Username check error:", error);
    res.status(500).json({ error: "Failed to check username" });
  }
};

exports.sendResetPasswordEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    user.resetOtp = otp;
    user.resetOtpExpiry = otpExpiry;
    await user.save();

    // Send email (use your actual email service)
    await sendEmail({
      to: user.email,
      subject: "Reset Your Password - OTP",
      text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
    });

    res.status(200).json({ message: "OTP sent to email successfully" });
  } catch (error) {
    console.error("Send reset password OTP error:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  try {
    const user = await User.findOne({
      email: email.toLowerCase(),
      deleted: false,
    }).select("+resetOtp +resetOtpExpiry");

    console.log("User found:", user);

    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({ error: "Invalid OTP or email" });
    }

    if (user.resetOtp !== otp) {
      return res.status(401).json({ error: "Incorrect OTP" });
    }

    if (Date.now() > user.resetOtpExpiry) {
      return res.status(410).json({ error: "OTP has expired" });
    }

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Email and new password are required" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.password = await bcrypt.hash(password, 10);

    // Clear OTP after successful password reset
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;

    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};
