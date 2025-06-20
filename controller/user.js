const Group = require("../models/group");
const User = require("../models/user");
const mentor = require("../models/mentor");

const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2; // Import Cloudinary SDK
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const registerUser = async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      schoolName,
      aboutMe,
      courseMajor,
      graduationMonth,
      graduationYear,
      selectedInterests,
      password,
    } = req.body;
    console.log(req.body);
    console.log(req.files);
    // Multer will now attach file info to req.files from in-memory or disk storage
    // If using disk storage, req.files[0].path will be the temporary local path
    // If using memory storage, req.files[0].buffer will contain the file data

    const transcriptFile = req.files["transcriptImage"]
      ? req.files["transcriptImage"][0]
      : null;

    const studentIdFile = req.files["studentIdImage"]
      ? req.files["studentIdImage"][0]
      : null;

    const ProfilePic = req.files["profileImage"]
      ? req.files["profileImage"][0]
      : null;
    // Basic validation for text fields
    // if (
    //   !firstName ||
    //   !lastName ||
    //   !schoolName ||
    //   !courseMajor ||
    //   !graduationMonth ||
    //   !graduationYear
    // ) {
    //   return res
    //     .status(400)
    //     .json({ message: "All required text fields are missing." });
    // }

    // // Validate if files were provided
    // if (!transcriptFile || !studentIdFile) {
    //   return res.status(400).json({
    //     message: "Both transcript and student ID images are required.",
    //   });
    // }

    let transcriptImageUrl = null;
    let studentIdImageUrl = null;

    // try {
    //   // Upload transcript image to Cloudinary
    //   // Use transcriptFile.path if Multer is configured for disk storage
    //   // Use transcriptFile.buffer if Multer is configured for memory storage
    //   const transcriptUploadResult = await cloudinary.uploader.upload(
    //     transcriptFile.path,
    //     {
    //       folder: "registration_transcripts", // Optional: specify a folder in Cloudinary
    //       resource_type: "image", // Ensure it's treated as an image
    //     }
    //   );
    //   transcriptImageUrl = transcriptUploadResult.secure_url;

    //   // Upload student ID image to Cloudinary
    //   const studentIdUploadResult = await cloudinary.uploader.upload(
    //     studentIdFile.path,
    //     {
    //       folder: "registration_student_ids", // Optional: specify a folder in Cloudinary
    //       resource_type: "image",
    //     }
    //   );
    //   studentIdImageUrl = studentIdUploadResult.secure_url;

    //   // Upload student ID image to Cloudinary
    //   const studentProfileUploadResult = await cloudinary.uploader.upload(
    //     ProfilePic.path,
    //     {
    //       folder: "profile_images", // Optional: specify a folder in Cloudinary
    //       resource_type: "image",
    //     }
    //   );
    //   studentProfileImageUrl = studentProfileUploadResult.secure_url;
    // } catch (uploadError) {
    //   console.error("Cloudinary Upload Error:", uploadError);
    //   return res.status(500).json({
    //     message: "Failed to upload images to Cloudinary.",
    //     error: uploadError.message,
    //   });
    // }

    const newUser = new User({
      email,
      firstName,
      lastName,
      schoolName,
      aboutMe,
      courseMajor,
      graduationMonth,
      graduationYear,
      password,
      profileImage: studentProfileImageUrl,
      transcriptImage: transcriptImageUrl, // Save Cloudinary URL
      studentIdImage: studentIdImageUrl, // Save Cloudinary URL
      selectedInterests: selectedInterests ? JSON.parse(selectedInterests) : [],
    });

    await newUser.save();

    // --- Generate JWT Token ---
    const payload = {
      user: {
        id: newUser._id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) {
          console.error("JWT Sign Error:", err);
          return res.status(500).json({ message: "Error generating token." });
        }
        res.status(201).json({
          message: "Registration successful!",
          user: newUser,
          token: token,
        });
      }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({
      message: "Server error during registration.",
      error: error.message,
    });
  }
};

// NEW: Login User Controller (NO ENCRYPTION - NOT RECOMMENDED)
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  // Basic validation
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please enter both email and password." });
  }

  try {
    // 1. Check if user exists by email
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid credentials. User not found." });
    }

    // 2. Compare provided password directly with stored plain-text password
    // This is INSECURE and NOT RECOMMENDED for production.
    const isMatch = password === user.password; // <--- DIRECT PASSWORD COMPARISON

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials. Password incorrect." });
    }

    // 3. If credentials are valid, generate JWT
    const payload = {
      user: {
        id: user._id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" }, // Token expiration (e.g., 1 hour)
      (err, token) => {
        if (err) {
          console.error("JWT Sign Error:", err);
          return res.status(500).json({ message: "Error generating token." });
        }
        // 4. Send success response with token
        res.status(200).json({
          message: "Login successful!",
          token: token,
          user,
        });
      }
    );
  } catch (error) {
    console.error("Error during login:", error);
    res
      .status(500)
      .json({ message: "Server error during login.", error: error.message });
  }
};

const createGroup = async (req, res) => {
  try {
    const {
      groupName,
      major,
      category,
      groupDescription,
      userId, // Expecting the userId from the frontend in the request body
    } = req.body;
    console.log(req.body);
    // The group icon file will be in req.file (if only one file input) or req.files (if multiple)
    // Assuming a single file input for group icon named 'groupIcon'
    const groupIconFile = req.file;
    console.log(groupIconFile);
    // --- Validation ---
    if (!groupName || !major || !category || !userId) {
      return res.status(400).json({
        message: "Group name, major, category, and user ID are required.",
      });
    }

    // Check if the user (creator) exists
    const creatorUser = await User.findById(userId);
    if (!creatorUser) {
      return res.status(404).json({ message: "Creator user not found." });
    }

    let iconUrl = null;
    if (groupIconFile) {
      // Only attempt upload if a file was provided
      try {
        // Upload group icon to Cloudinary (assuming Multer memory storage here)
        const uploadResult = await cloudinary.uploader.upload(
          groupIconFile.path,
          {
            folder: "group_icon", // Optional: specify a folder in Cloudinary
            resource_type: "image",
          }
        );
        iconUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary Upload Error (Group Icon):", uploadError);
        // It's okay to continue if icon is optional, or return error if mandatory
        return res.status(500).json({
          message: "Failed to upload group icon.",
          error: uploadError.message,
        });
      }
    }

    // --- Create New Group ---
    const newGroup = new Group({
      name: groupName,
      major,
      category,
      description: groupDescription,
      iconUrl, // This will be null if no icon was uploaded
      creator: userId, // Set the creator
      members: [userId], // Add creator as the first member of the group
    });

    await newGroup.save();

    // --- Update User's createdCourse Array ---
    creatorUser.createdGroup.push(newGroup._id); // Add the new group's ID
    await creatorUser.save();

    res.status(201).json({
      message: "Group created successfully!",
      group: newGroup,
      creatorUser: creatorUser, // Optionally send back the updated user
    });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({
      message: "Server error during group creation.",
      error: error.message,
    });
  }
};

const getAllGroups = async (req, res) => {
  try {
    // Find all groups in the database
    // .populate('creator', 'firstName lastName email') is optional but useful
    // It replaces the 'creator' ObjectId with the actual user document (or selected fields)
    // This helps in displaying the creator's name or email alongside the group.
    const groups = await Group.find({}).populate(
      "creator",
      "firstName lastName email"
    ); // Populate creator's basic info

    res.status(200).json({
      message: "Groups fetched successfully!",
      count: groups.length,
      groups: groups,
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({
      message: "Server error fetching groups.",
      error: error.message,
    });
  }
};

// --- NEW: Join Group Controller ---
const joinGroup = async (req, res) => {
  const { userId, groupId } = req.body; // Expect userId and groupId from request body
  console.log(req.body);
  // Basic validation
  if (!userId || !groupId) {
    return res
      .status(400)
      .json({ message: "User ID and Group ID are required to join a group." });
  }

  try {
    // 1. Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    // 2. Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 3. Check if user is already a member of the group
    if (group.members.includes(userId)) {
      return res
        .status(409)
        .json({ message: "User is already a member of this group." });
    }

    // 4. Add user to group's members array
    group.members.push(userId);
    await group.save();

    // 5. Add group to user's partOfCourse array
    // Ensure 'partOfCourse' is the correct field name in your User model
    if (!user.partOfGroup.includes(groupId)) {
      // Prevent duplicate entries in user's side too
      user.partOfGroup.push(groupId);
      await user.save();
    }

    res.status(200).json({
      message: "Successfully joined group!",
      group: group,
      user: user, // Optionally send back the updated user object
    });
  } catch (error) {
    console.error("Error joining group:", error);
    res.status(500).json({
      message: "Server error during group join operation.",
      error: error.message,
    });
  }
};

// --- NEW: Join Group Controller ---
const connectMentors = async (req, res) => {
  const { userId, mentorId } = req.body; // Expect userId and groupId from request body
  console.log(req.body);
  // Basic validation
  if (!userId || !mentorId) {
    return res
      .status(400)
      .json({ message: "User ID and Mentor ID are required to join a group." });
  }

  try {
    // 1. Find the group
    const Mentor = await mentor.findById(mentorId);
    if (!Mentor) {
      return res.status(404).json({ message: "Mentor not found." });
    }

    // 2. Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 3. Check if user is already a member of the group
    if (Mentor.ConnectedStudents.includes(userId)) {
      return res
        .status(409)
        .json({ message: "User is already a member of this group." });
    }

    // 4. Add user to group's members array
    Mentor.ConnectedStudents.push(userId);
    await Mentor.save();

    // 5. Add group to user's partOfCourse array
    // Ensure 'partOfCourse' is the correct field name in your User model
    if (!user.connectedMentors.includes(mentorId)) {
      // Prevent duplicate entries in user's side too
      user.connectedMentors.push(mentorId);
      await user.save();
    }

    res.status(200).json({
      message: "Successfully connected to Mentor!",
      mentor: Mentor,
      user: user, // Optionally send back the updated user object
    });
  } catch (error) {
    console.error("Error joining group:", error);
    res.status(500).json({
      message: "Server error during group join operation.",
      error: error.message,
    });
  }
};

// --- NEW: Edit Profile Controller ---
const editProfile = async (req, res) => {
  // We'll assume userId comes from the request body,
  // typically you'd get this from an authenticated user's JWT token
  // For now, based on frontend, we expect it in req.body for simplicity.
  const { userId, aboutMe, schoolName, selectedInterests } = req.body;
  console.log(req.body);
  // Basic validation
  if (!userId) {
    return res
      .status(400)
      .json({ message: "User ID is required to edit profile." });
  }

  try {
    // 1. Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 2. Update user fields
    // Only update if the fields are provided in the request body
    if (aboutMe !== undefined) {
      user.aboutMe = aboutMe;
    }
    if (schoolName !== undefined) {
      user.schoolName = schoolName;
    }
    if (selectedInterests !== undefined) {
      // Ensure selectedInterests is an array, parse if it's a JSON string
      user.selectedInterests = Array.isArray(selectedInterests)
        ? selectedInterests
        : JSON.parse(selectedInterests);
    }

    // 3. Save the updated user
    await user.save();

    // 4. Send success response
    // Optionally send back the updated user object (excluding sensitive data like password)
    const updatedUserResponse = { ...user._doc }; // Create a copy of the Mongoose document as a plain object
    delete updatedUserResponse.password; // Remove password before sending back

    res.status(200).json({
      message: "Profile updated successfully!",
      user: updatedUserResponse,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      message: "Server error during profile update.",
      error: error.message,
    });
  }
};

// --- NEW: Get User Profile by ID Controller ---
const getUserProfileById = async (req, res) => {
  const userId = req.body.id; // Get the user ID from the URL parameters

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    const user = await User.findById(userId)
      .select("-password -transcriptImage -studentIdImage") // Exclude sensitive fields
      .populate("createdGroup") // Populate group name, members, icon
      .populate({
        path: "partOfGroup",
        populate: {
          path: "creator", // This assumes your Group model has a 'creator' field that references User
          select: "-password -transcriptImage -studentIdImage", // Optional: exclude sensitive info from creator
        },
      });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "User profile fetched successfully!",
      user: user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      message: "Server error fetching user profile.",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  createGroup,
  getAllGroups,
  joinGroup,
  editProfile, // Don't forget to export the new controller
  getUserProfileById, // Export the new controller
  connectMentors,
};
