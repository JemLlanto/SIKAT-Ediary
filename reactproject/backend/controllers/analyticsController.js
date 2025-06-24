const db = require("../database");

const fetchingAllUsers = (req, res) => {
  const departmentID = req.query;

  let query = `
    SELECT u.*
    FROM user_table u
    JOIN course_department c ON u.departmentID = c.departmentID
    WHERE u.departmentID = ?
  `;

  db.query(query, [departmentID], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
};

const fetchingFlaggedUsers = (req, res) => {
  const departmentID = req.query;

  if (!departmentID) {
    return res.status(400).json({ error: "Department ID is required" });
  }

  const query = `
    SELECT 
      diary_entries.entryID,
      diary_entries.title,
      diary_entries.isFlagged,
      diary_entries.flagCount,
      diary_entries.isAddress,
      user_table.departmentID,
      user_table.firstName,
      user_table.lastName,
      user_profiles.profile_image,
      flagged_reports.created_at
    FROM diary_entries
    LEFT JOIN user_table ON diary_entries.userID = user_table.userID
    LEFT JOIN user_profiles ON diary_entries.userID = user_profiles.userID
    LEFT JOIN flagged_reports ON diary_entries.entryID = flagged_reports.entryID
    WHERE diary_entries.isFlagged = 1 AND user_table.departmentID = ?  -- Filter by departmentID
    ORDER BY diary_entries.isAddress, diary_entries.flagCount DESC
  `;

  db.query(query, [departmentID], (err, results) => {
    if (err) {
      console.error("Error fetching reports:", err.message);
      return res.status(500).json({ error: "Error fetching flagged reports" });
    }
    res.status(200).json(results);
  });
};

const fetchingReportedComments = (req, res) => {
  const query = `
  SELECT 
  comments.*,
  user_table.firstName,
  user_table.lastName,
  user_table.studentNumber,
  user_table.departmentID
  FROM comments
  JOIN user_table ON comments.userID = user_table.userID
  WHERE comments.isReported = 1 AND comments.isReviewed = 0
  ORDER BY comments.isReviewed, comments.reportCount DESC ;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching reported comments:", err.message);
      return res
        .status(500)
        .json({ error: "Error fetching reported comments" });
    }
    res.status(200).json(results);
  });
};

const fetchingReportedUsers = (req, res) => {
  const query = `
    SELECT
      user_table.*,
      user_profiles.profile_image
    FROM 
      user_table
    JOIN user_profiles ON user_table.userID = user_profiles.userID
    WHERE user_table.isReported = 1 AND user_table.isReviewed = 0
    ORDER BY user_table.isReviewed, user_table.reportCount DESC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching reported users:", err.message);
      return res.status(500).json({ error: "Error fetching reported users" });
    }
    // console.log("results: ", results[0]);
    res.status(200).json(results);
  });
};

module.exports = {
  fetchingAllUsers,
  fetchingFlaggedUsers,
  fetchingReportedComments,
  fetchingReportedUsers,
};
