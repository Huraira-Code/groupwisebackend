const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const cors = require("cors");
const { query, check, validationResult } = require("express-validator");
const {
  getDashboardCounts,
  getAllMentor,
  updateMentorStatus,
  adminLogin,
  addAdmin,
} = require("../controller/admin");

router.route("/getDashboardcound").post(getDashboardCounts);
router.route("/getAllMentor").post(getAllMentor);
router.route("/UpdateMentorStatus").post(updateMentorStatus);

router.route("/adminLogin").post(adminLogin);
router.route("/addAdmin").post(addAdmin);
module.exports = router;
