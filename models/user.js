// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  schoolName: {
    type: String,
    required: true,
    trim: true,
  },
  aboutMe: {
    type: String,
    maxlength: 150,
    trim: true,
  },
  courseMajor: {
    type: String,
    required: true,
    trim: true,
  },
  graduationMonth: {
    type: String, // Store as string to handle month names or numbers
    required: true,
    trim: true,
  },
  graduationYear: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  transcriptImage: {
    type: String, // Store the path/URL to the uploaded image
  },
  profileImage: {
    type: String,
  },
  studentIdImage: {
    type: String, // Store the path/URL to the uploaded image
  },
  selectedInterests: [
    {
      type: String, // Array of strings for interests
      trim: true,
    },
  ],
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  createdGroup: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group", // Assuming your course/group model is named 'Group'
      default: [], // Default to an empty array
    },
  ],
  partOfGroup: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group", // Assuming your course/group model is named 'Group'
      default: [], // Default to an empty array
    },
  ],
  connectedMentors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor", // Assuming your mentor model is named 'Mentor'
      default: [], // Default to an empty array
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
