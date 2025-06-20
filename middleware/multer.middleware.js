const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Use disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Save to /uploads directory
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, name);
  },
});

// Create the multer instance
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
  },
});

/**
 * Upload a single file from a specific field
 * @param {string} fieldName
 */
const uploadSingle = (fieldName) => upload.single(fieldName);

/**
 * Upload multiple files from a single field
 * @param {string} fieldName
 * @param {number} maxCount
 */
const uploadMultiple = (fieldName, maxCount = 10) =>
  upload.array(fieldName, maxCount);

/**
 * Upload multiple named fields, each with max file count
 * @param {Array<{name: string, maxCount: number}>} fields
 */
const uploadFields = (fields) => upload.fields(fields);

/**
 * Raw multer instance (if needed)
 */
const rawUpload = upload;

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  rawUpload,
};
