const express = require("express");
const router = express.Router();
const {
  fetchingEntries,
  uploadImageForAdminEntry,
  insertAdminPost,
  fetchingUserEntries,
  fetchSingleEntry,
  uploadingDiaryImage,
  uploadingDiary,
} = require("../controllers/entriesController");

router.post("/entry", uploadingDiaryImage, uploadingDiary);

router.get("/fetchEntries", fetchingEntries);

router.get("/fetchLeftSideEntry/:id", fetchingUserEntries);

router.get("/fetchDiaryEntry/:entryID", fetchSingleEntry);

router.post("/insertAdminEntry", uploadImageForAdminEntry, insertAdminPost);

module.exports = router;
