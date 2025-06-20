// routes/registrationRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  registerUser,
  loginUser,
  createGroup,
  getAllGroups,
  joinGroup,
  editProfile,
  getUserProfileById,
  connectMentors,
} = require("../controller/user");
const { uploadFields, uploadSingle } = require("../middleware/multer.middleware");

// const path = require('path'); // No longer strictly needed if using memory stora

// Route for user registration
router.post(
  "/register",
  uploadFields([
    { name: "transcriptImage", maxCount: 1 },
    { name: "studentIdImage", maxCount: 1 },
    { name: "profileImage", maxCount: 1 },
  ]),

  registerUser
);

// Route for user registration
router.post("/login", loginUser);
router.post(
  "/groupcreate", // A descriptive path for group creation
  uploadSingle("groupIcon"), // Expects a single file upload named 'groupIcon'
  createGroup
);
router.post("/getAllGroup", getAllGroups);

router.post("/groupjoin", joinGroup); // <--- New route
router.put("/editProfile", editProfile); // <--- New route for profile edits
router.post("/getProfile", getUserProfileById); // <--- New route for profile edits
router.post("/connectMentor", connectMentors); // <--- New route for profile edits

module.exports = router;
