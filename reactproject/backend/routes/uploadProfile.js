const express = require("express");
const router = express.Router();
const {
  uploadToCloudinary,
  uploadProfile,
} = require("../controllers/uploadProfileController");

router.post("/uploadProfile", uploadToCloudinary, uploadProfile);

module.exports = router;
