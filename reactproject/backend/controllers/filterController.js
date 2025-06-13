const db = require("../database");
const bcrypt = require("bcryptjs");

const addFilter = (req, res) => {
  const { subject } = req.body;

  // Check if the subject already exists
  db.query(
    "SELECT * FROM filter_subjects WHERE subject = ?",
    [subject],
    (err, results) => {
      if (err) {
        console.error("Error checking filter:", err);
        return res.status(500).json({ error: "Failed to check filter" });
      }

      if (results.length > 0) {
        // Subject already exists
        console.error("Filter already exists");
        return res.status(409).json({ message: "Filter already exists" });
      }

      // Insert new filter
      db.query(
        "INSERT INTO filter_subjects (subject) VALUES (?)",
        [subject],
        (err, result) => {
          if (err) {
            console.error("Error adding filter:", err);
            return res.status(500).json({ error: "Failed to add filter" });
          }

          res.status(201).json({
            message: "Filter added successfully",
            filterID: result.insertId,
          });
        }
      );
    }
  );
};

const editingFilter = (req, res) => {
  const { subjectID } = req.params;
  const { subject } = req.body;

  if (subject) {
    db.query(
      "SELECT * FROM filter_subjects WHERE subject = ?",
      [subject],
      (err, results) => {
        if (err) {
          console.error("Error checking filter:", err);
          return res.status(500).json({ error: "Failed to check filter" });
        }

        if (results.length > 0) {
          // Subject already exists
          console.error("Filter already exists");
          return res.status(409).json({ message: "Filter already exists" });
        }

        // Insert new filter
        db.query(
          "UPDATE filter_subjects SET subject = ? WHERE subjectID = ?",
          [subject, subjectID],
          (err, result) => {
            if (err) {
              console.error(err);
              res.status(500).json({ error: "Failed to update subject" });
            } else {
              if (result.affectedRows > 0) {
                res.json({ message: "Subject updated successfully" });
              } else {
                res.status(404).json({ error: "Subject not found" });
              }
            }
          }
        );
      }
    );
  } else {
    res.status(400).json({ error: "Reason is required" });
  }
};

const deletingFilter = (req, res) => {
  const { subjectID } = req.params;

  db.query(
    "DELETE FROM filter_subjects WHERE subjectID = ?",
    [subjectID],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete subject" });
      } else {
        if (result.affectedRows > 0) {
          res.json({ message: "Subject deleted successfully" });
        } else {
          res.status(404).json({ error: "Subject not found" });
        }
      }
    }
  );
};

module.exports = { addFilter, editingFilter, deletingFilter };
