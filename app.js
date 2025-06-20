const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./database/connect");
const app = express();
// const cookieParser = require("cookie-parser"); // Import cookie-parser
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
require("dotenv").config(); // Load environment variables from .env file

// app.use(express.static("uploads"));
// const officeHolder = require("./models/officeHolder");
const PORT = 2000;
// const multer = require("multer");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // Destination folder for uploaded files
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });

// const upload = multer({ storage: storage });
const user_routes = require("./routes/user");
const mentor_routes = require("./routes/mentor");

const admin_routes = require("./routes/admin");
// const notification_routes = require("./routes/notification");

app.get("/", (req, res) => {
  res.send("Welcome to anonymous app");
});

//middleware or to set router
app.use(
  cors({
    origin: "*", // Allow requests from this origin
    credentials: true, // Allow sending cookies
  })
);


app.use("/api/user", user_routes);
app.use("/api/mentors", mentor_routes);
app.use("/api/admin", admin_routes);
// app.use("/api/notification", notification_routes);

const start = async () => {
  try {
    await connectDB();
    app.listen(
      2000,
      console.log(`server is running at http://localhost:${PORT}`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
