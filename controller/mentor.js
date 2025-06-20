// controllers/mentorController.js
const jwt = require("jsonwebtoken");
const mentor = require("../models/mentor");
const cloudinary = require("cloudinary").v2; // Import Cloudinary SDK
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const { StreamChat } = require("stream-chat"); // Import the server-side SDK
const API_KEY = "f4jd4sm2swcv"; // Get from environment variables
const API_SECRET =
  "q3muj4hurg56dsbhgg886pm3n4pg3etzg6hufccw8bh484znkf2396kngc7m84kv"; // Get from environment variables
const serverClient = StreamChat.getInstance(API_KEY, API_SECRET);

// Ensure you have a JWT_SECRET defined in your environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"; // Use a strong, secret key in production

// --- Create Mentor Controller ---
// In your createMentor function:
const createMentor = async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      schoolName,
      aboutMe,
      password,
      selectedInterests,
    } = req.body;
    console.log(req.body);

    // --- CHANGE THIS LINE ---
    // For upload.array(), files are in req.files (an array)
    const supportingDocumentFiles = req.files; // Renamed for clarity (plural)
    console.log("Uploaded Files:", supportingDocumentFiles); // Log the array

    // --- Validation ---
    if (!email || !firstName || !lastName || !schoolName || !password) {
      return res.status(400).json({
        message:
          "Please fill all required fields: email, first name, last name, school name, and password.",
      });
    }

    const existingMentor = await mentor.findOne({ email });
    if (existingMentor) {
      return res
        .status(409)
        .json({ message: "Mentor with this email already exists." });
    }

    const plainTextPassword = password;

    let supportingDocumentUrls = []; // Initialize an empty array for multiple URLs

    if (supportingDocumentFiles && supportingDocumentFiles.length > 0) {
      // Iterate over each uploaded file
      for (const file of supportingDocumentFiles) {
        try {
          const uploadResult = await cloudinary.uploader.upload(
            file.path, // Use file.path for disk storage
            {
              folder: "mentor_documents",
              resource_type: "auto",
            }
          );
          supportingDocumentUrls.push(uploadResult.secure_url);
        } catch (uploadError) {
          console.error(
            `Cloudinary Upload Error for ${file.originalname}:`,
            uploadError
          );
          // Decide how to handle individual file upload failures:
          // - Continue to upload others?
          // - Abort and return error? (Current implementation aborts)
          return res.status(500).json({
            message: `Failed to upload supporting document: ${file.originalname}.`,
            error: uploadError.message,
          });
        }
      }
    }

    const newMentor = new mentor({
      email,
      firstName,
      lastName,
      schoolName,
      aboutMe,
      password: plainTextPassword,
      supportingDocument: supportingDocumentUrls, // Store the array of URLs
      selectedInterests,
    });

    await newMentor.save();

    const mentorResponse = newMentor.toObject();
    delete mentorResponse.password;
    await serverClient.upsertUser({
      id: newMentor._id.toString(),
    });

    console.log("Mentor Response", mentorResponse);
    res.status(201).json({
      message: "Mentor created successfully!",
      mentor: mentorResponse,
    });
  } catch (error) {
    console.error("Error creating mentor:", error);
    res.status(500).json({
      message: "Server error during mentor creation.",
      error: error.message,
    });
  }
};

// --- Login Mentor Controller ---
const loginMentor = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Find mentor by email
    const mentorFinal = await mentor.findOne({ email });
    if (!mentorFinal) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // --- SECURITY WARNING: Comparing plain text passwords ---
    // NO HASHING COMPARISON: Compare directly
    if (password !== mentorFinal.password) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: mentorFinal._id, role: "mentor" }, // Payload can include user ID and role
      JWT_SECRET,
      { expiresIn: "24h" } // Token expires in 1 hour
    );
    console.log(mentorFinal._id.toString());
    const Videotoken = serverClient.createToken(mentorFinal._id.toString());

    // Respond with mentor data and token (exclude password)
    const mentorResponse = mentorFinal.toObject();
    delete mentorResponse.password;

    res.status(200).json({
      message: "Mentor logged in successfully!",
      token,
      Videotoken,
      mentor: mentorResponse,
    });
  } catch (error) {
    console.error("Error logging in mentor:", error);
    res.status(500).json({
      message: "Server error during mentor login.",
      error: error.message,
    });
  }
};

// --- Edit Mentor Profile Controller ---
const editMentor = async (req, res) => {
  try {
    const mentorId = req.params.mentorId; // Get mentor ID from URL parameters
    // In a real application, you would get the authenticated user's ID from req.user.id
    // const authenticatedUserId = req.user.id;

    const {
      firstName,
      lastName,
      schoolName,
      aboutMe,
      selectedInterests,
      // email and password are typically not updated via this endpoint directly without re-authentication
    } = req.body;

    console.log(req.body);
    console.log(mentorId);
    // Find the mentor by ID
    const mentorToUpdate = await mentor.findById(mentorId);

    if (!mentorToUpdate) {
      return res.status(404).json({ message: "Mentor not found." });
    }

    // --- Authorization Check (Crucial for production) ---
    // In a real app, ensure the authenticated user can only update their own profile:
    // if (mentorToUpdate._id.toString() !== authenticatedUserId) {
    //   return res.status(403).json({ message: "Unauthorized to edit this profile." });
    // }

    // Update fields if they are provided in the request body
    if (firstName) mentorToUpdate.firstName = firstName;
    if (lastName) mentorToUpdate.lastName = lastName;
    if (schoolName) mentorToUpdate.schoolName = schoolName;
    if (aboutMe) mentorToUpdate.aboutMe = aboutMe;
    if (selectedInterests) mentorToUpdate.selectedInterests = selectedInterests;

    await mentorToUpdate.save();

    // Respond with success (excluding password for the response)
    const updatedMentorResponse = mentorToUpdate.toObject();
    delete updatedMentorResponse.password;

    res.status(200).json({
      message: "Mentor profile updated successfully!",
      mentor: updatedMentorResponse,
    });
  } catch (error) {
    console.error("Error updating mentor profile:", error);
    res.status(500).json({
      message: "Server error during mentor profile update.",
      error: error.message,
    });
  }
};

// --- Get Mentor Controller ---
const getMentor = async (req, res) => {
  try {
    const mentorId = req.params.mentorId; // Get mentor ID from URL parameters

    // Find the mentor by ID and populate the 'connectedStudents' field
    // It assumes your 'mentor' model has a 'connectedStudents' field
    // which is an array of ObjectIds referencing your 'student' model.
    const fetchedMentor = await mentor
      .findById(mentorId)
      .populate("ConnectedStudents"); // Populate with specific student fields

    if (!fetchedMentor) {
      return res.status(404).json({ message: "Mentor not found." });
    }

    // Exclude sensitive information like password before sending response
    const mentorResponse = fetchedMentor.toObject();
    delete mentorResponse.password;

    res.status(200).json({
      message: "Mentor data fetched successfully!",
      mentor: mentorResponse,
    });
  } catch (error) {
    console.error("Error fetching mentor:", error);
    res.status(500).json({
      message: "Server error during mentor data retrieval.",
      error: error.message,
    });
  }
};

const getAllMentor = async (req, res) => {
  try {
    // Find all documents in the Mentor collection
    const fetchedMentors = await mentor.find({}).populate("ConnectedStudents"); // Assuming 'ConnectedStudents' refers to users/students

    if (!fetchedMentors || fetchedMentors.length === 0) {
      return res.status(404).json({ message: "No mentors found." });
    }

    // Exclude sensitive information (like password) for each mentor before sending the response
    const mentorsResponse = fetchedMentors.map((mentor) => {
      const mentorObj = mentor.toObject();
      delete mentorObj.password; // It's crucial to remove sensitive fields like password
      // If your Mentor schema has other sensitive fields not meant for public viewing,
      // such as private contact info or internal notes, delete them here too.
      return mentorObj;
    });

    res.status(200).json({
      message: "All mentors fetched successfully!",
      mentors: mentorsResponse,
    });
  } catch (error) {
    console.error("Error fetching all mentors:", error);
    res.status(500).json({
      message: "Server error during mentor data retrieval.",
      error: error.message,
    });
  }
};

module.exports = {
  createMentor,
  loginMentor,
  editMentor,
  getMentor,
  getAllMentor,
};
