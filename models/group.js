// models/Group.js
const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true // Group names should probably be unique
  },
  major: { // Corresponds to 'major' in your frontend
    type: String,
    required: true,
    trim: true
  },
  category: { // Corresponds to 'category' in your frontend
    type: String,
    required: true,
    trim: true
  },
  description: { // Corresponds to 'groupDescription' in your frontend
    type: String,
    maxlength: 500, // Example max length
    trim: true
  },
  iconUrl: { // To store the Cloudinary URL of the group icon
    type: String,
    // required: true, // You might make this optional if skipping icon upload is allowed
  },
  creator: { // The user who created this group
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [ // Users who are part of this group/course
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Group", groupSchema);