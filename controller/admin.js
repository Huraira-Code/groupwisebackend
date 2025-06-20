const { query, check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const mentor = require("../models/mentor"); // Assuming 'mentor' is your Mongoose model for mentors
const Group = require("../models/group"); // Assuming 'Group' is your Mongoose model for groups
const User = require("../models/user"); // Assuming 'User' is your Mongoose model for users
const admin = require("../models/admin");

const getDashboardCounts = async (req, res) => {
  try {
    // Get total count of Users
    const userCount = await User.countDocuments();

    // Get total count of Groups
    const groupCount = await Group.countDocuments();

    // Get total count of Mentors
    const mentorCount = await mentor.countDocuments(); // Assuming 'mentor' is your model variable

    // Get count of Unapproved Mentors (assuming a 'status' field where false means not approved)
    const unapprovedMentorCount = await mentor.countDocuments({
      status: false,
    });

    // Return all counts
    res.status(200).json({
      success: true,
      data: {
        userCount,
        groupCount,
        mentorCount,
        unapprovedMentorCount,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard counts:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard counts.",
      error: error.message,
    });
  }
};

// --- NEW: Controller to return all mentors ---
const getAllMentor = async (req, res) => {
  try {
    // Find all mentor documents
    const mentors = await mentor.find({}); // The empty object {} finds all documents

    // Return the found mentors
    res.status(200).json({
      success: true,
      message: "Mentors fetched successfully.",
      mentors: mentors,
    });
  } catch (error) {
    console.error("Error fetching all mentors:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching mentors.",
      error: error.message,
    });
  }
};

const updateMentorStatus = async (req, res) => {
  const { mentorId, status } = req.body;

  try {
    // Find the mentor by ID and update their status
    const updatedMentor = await mentor.findByIdAndUpdate(
      mentorId,
      { status: status }, // Dynamically set the status field
      { new: true } // Return the updated document
    );

    if (!updatedMentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found.",
      });
    }

    const action = status ? "approved" : "deapproved";
    res.status(200).json({
      success: true,
      message: `Mentor ${action} successfully.`,
      mentor: updatedMentor, // Send back the updated mentor document
    });
  } catch (error) {
    console.error(`Error updating mentor status for ID ${mentorId}:`, error);
    res.status(500).json({
      success: false,
      message: "Server error during mentor status update.",
      error: error.message,
    });
  }
};

const addAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if an admin with this email already exists
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({
        success: false,
        message: "Admin with this email already exists.",
      });
    }

    // Create a new admin instance
    admin = new Admin({
      email,
      password, // WARNING: Plain text password! Hash this in production!
    });

    // Save the admin to the database
    await admin.save();

    res.status(201).json({
      success: true,
      message: "Admin added successfully.",
      admin: {
        id: admin._id,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Error adding admin:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding admin.",
      error: error.message,
    });
  }
};

const adminLogin = async (req, res) => {
  // Input validation

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;
  console.log(req.body)

  try {
    // Check if admin exists
    let Admin = await admin.findOne({ email });
    if (!Admin) {
      console.log("a")
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials." });
    }

    // Compare passwords (WARNING: Plain text comparison!)
    // In production, you'd compare hashed passwords here (e.g., bcrypt.compare(password, admin.password))
    if (Admin.password !== password) {
      console.log("b")
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials." });
    }

    // Admin authenticated, create and return JWT token
    const payload = {
      admin: {
        id: admin._id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" }, // Token expires in 1 hour
      (err, token) => {
        if (err) throw err;
        res.status(200).json({
          success: true,
          message: "Admin logged in successfully.",
          token,
          admin: {
            id: admin._id,
            email: admin.email,
          },
        });
      }
    );
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({
      success: false,
      message: "Server error during admin login.",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardCounts,
  getAllMentor, // Export the new controller
  updateMentorStatus,
  addAdmin,
  adminLogin,
};
