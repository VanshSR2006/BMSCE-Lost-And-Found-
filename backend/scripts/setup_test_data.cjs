const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");
const Item = require("../models/Item");
const Notification = require("../models/Notification");

const setup = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // 1. Create Test Users
    const password = await bcrypt.hash("password123", 10);
    
    // User A
    let userA = await User.findOne({ email: "test1@bmsce.ac.in" });
    if (!userA) {
      userA = await User.create({
        name: "Test User A",
        email: "test1@bmsce.ac.in",
        password,
        role: "user"
      });
    }

    // User B
    let userB = await User.findOne({ email: "test2@bmsce.ac.in" });
    if (!userB) {
      userB = await User.create({
        name: "Test User B",
        email: "test2@bmsce.ac.in",
        password,
        role: "user"
      });
    }

    // 2. Create Match Items
    const lostItem = await Item.create({
      title: "Lost Black Backpack",
      description: "Contains books and a laptop.",
      type: "lost",
      category: "electronics",
      location: "Library",
      date: new Date().toISOString(),
      createdBy: userA._id
    });

    const foundItem = await Item.create({
      title: "Found Black Backpack",
      description: "Found near library entrance.",
      type: "found",
      category: "electronics",
      location: "Library",
      date: new Date().toISOString(),
      createdBy: userB._id
    });

    // 3. Create Notification for User A
    await Notification.create({
      user: userA._id,
      message: "Possible match detected: Found Black Backpack",
      type: "match",
      lostItem: lostItem._id,
      foundItem: foundItem._id,
      status: "pending"
    });

    console.log("✅ Test data created successfully!");
    console.log("Login User A: test1@bmsce.ac.in / password123");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Setup failed:", err);
    process.exit(1);
  }
};

setup();
