import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/users"; // Adjust the path to your User model

const createAdminUser = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/SindhiLingo");

    const email = "JohnAbrahim@black.com";
    const password = "Yoongibaba";
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    const adminUser = new User({
      name: "Admin",
      email,
      password: hashedPassword,
      isAdmin: true, // Set the admin flag
    });

    await adminUser.save();
    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    mongoose.connection.close();
  }
};

createAdminUser();