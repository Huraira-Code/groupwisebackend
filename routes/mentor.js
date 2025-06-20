const express = require("express");
const router = express.Router();
const { createMentor, loginMentor, editMentor, getMentor, getAllMentor } = require("../controller/mentor");
const { uploadMultiple } = require("../middleware/multer.middleware");
const { connectMentors } = require("../controller/user");


router.post("/register", uploadMultiple("supportingDocumentFiles"), createMentor);
router.post("/login", loginMentor);
router.post("/editmentor/:mentorId", editMentor);
router.post("/getmentor/:mentorId", getMentor);
router.post("/getallmentor", getAllMentor);
router.post("/connectMentor", connectMentors);

module.exports = router;