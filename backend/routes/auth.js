const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();

const buildUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || "",
  usn: user.usn || "",
  branch: user.branch || "",
  isUsnVerified: user.isUsnVerified || false,
});

const signUserToken = (user) => jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

// ---------------- SIGNUP ----------------
router.post("/signup", async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!email.endsWith("@bmsce.ac.in")) {
      return res.status(400).json({ message: "Use your BMSCE email only" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    const token = signUserToken(user);

    res.status(201).json({
      message: "Signup successful",
      token,
      user: buildUserResponse(user),
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed" });
  }
});

// ---------------- LOGIN ----------------
router.post("/login", async (req, res) => {
  try {
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = signUserToken(user);

    res.json({
      message: "Login successful",
      token,
      user: buildUserResponse(user),
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

// ---------------- ME ----------------
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      user: {
        ...buildUserResponse(user),
      }
    });
  } catch (err) {
    console.error("Session restore error:", err);
    res.status(500).json({ message: "Failed to restore session" });
  }
});

// ---------------- GOOGLE SIGN IN ----------------
const { OAuth2Client } = require("google-auth-library");

router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      return res.status(500).json({ message: "Google OAuth not configured on server" });
    }

    // Properly verify the Google ID token
    const oauthClient = new OAuth2Client(googleClientId);
    const ticket = await oauthClient.verifyIdToken({
      idToken: token,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    const { name, sub: googleId } = payload;
    const email = normalizeEmail(payload.email);

    if (!email.endsWith("@bmsce.ac.in")) {
      return res.status(400).json({ message: "Unauthorized: Use your @bmsce.ac.in email ONLY" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: await bcrypt.hash(googleId + process.env.JWT_SECRET, 10),
        role: "user",
      });
    }

    const serverToken = signUserToken(user);

    res.json({
      message: "Google Login successful",
      token: serverToken,
      user: buildUserResponse(user),
    });
  } catch (err) {
    console.error("Google verify error:", err);
    res.status(500).json({ message: "Google authentication failed" });
  }
});

// ---------------- UPDATE PROFILE ----------------
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { phone, usn, branch } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (phone) user.phone = phone;
    if (usn !== undefined) {
      const cleanUsn = usn.trim().toUpperCase();
      user.usn = cleanUsn;
      const usnRegex = /^1(BM|BF)\d{2}[A-Z]{2}\d{3}$/i;
      user.isUsnVerified = cleanUsn ? usnRegex.test(cleanUsn) : false;
    }
    if (branch) user.branch = branch;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        usn: user.usn,
        branch: user.branch,
        isUsnVerified: user.isUsnVerified,
      },
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

module.exports = router;
