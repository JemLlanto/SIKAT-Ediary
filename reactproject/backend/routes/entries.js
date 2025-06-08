const express = require("express");
const router = express.Router();
const {
  fetchingEntries,
  uploadImageForAdminEntry,
  insertAdminPost,
} = require("../controllers/entriesController");

router.get("/fetchEntries", fetchingEntries);

router.post("/insertAdminEntry", uploadImageForAdminEntry, insertAdminPost);

module.exports = router;
