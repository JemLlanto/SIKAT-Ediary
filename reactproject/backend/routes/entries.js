const express = require("express");
const router = express.Router();
const {
  fetchingEntries,
  uploadImageForAdminEntry,
  insertAdminPost,
  fetchingUserEntries,
} = require("../controllers/entriesController");

router.get("/fetchEntries", fetchingEntries);

router.get("/fetchLeftSideEntry/:id", fetchingUserEntries);

router.get("/fetchDiaryEntry/:entryID", (req, res) => {
  const entryID = req.params.entryID;

  const query = `
  SELECT diary_entries.*, 
         user_table.isAdmin, 
         user_table.isSuspended, 
         user_table.firstName, 
         user_table.lastName, 
         user_table.course, 
         user_profiles.*, 
         flagged_reports.isReviewed
  FROM diary_entries 
  INNER JOIN user_table ON diary_entries.userID = user_table.userID 
  INNER JOIN user_profiles ON diary_entries.userID = user_profiles.userID 
  LEFT JOIN flagged_reports ON diary_entries.entryID = flagged_reports.entryID 
  WHERE diary_entries.entryID = ?
`;

  db.query(query, [entryID], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.status(200).json({ entry: result[0] });
  });
});

router.post("/insertAdminEntry", uploadImageForAdminEntry, insertAdminPost);

module.exports = router;
