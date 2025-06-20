// models/User.js
const mongoose = require("mongoose");

const mentorSchema = new mongoose.Schema({
  profilePic: {
    type: String,
    default: null,
  },
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
  password: {
    type: String,
    required: true,
  },
  supportingDocument: [
    {
      type: String,
    },
  ],
  selectedInterests: {
    type: String,
  },
  ConnectedStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming your course/group model is named 'Group'
      default: [], // Default to an empty array
    },
  ],
  status: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Mentor", mentorSchema);
