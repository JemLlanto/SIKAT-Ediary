const db = require("../database");
const bcrypt = require("bcryptjs");

const addingCommentOption = (req, res) => {
  const { reason } = req.body;

  // Check if the option already exists
  db.query(
    "SELECT * FROM report_comments WHERE reason = ?",
    [reason],
    (err, results) => {
      if (err) {
        console.error("Error checking option:", err);
        return res.status(500).json({ error: "Failed to check option" });
      }

      if (results.length > 0) {
        // Subject already exists
        return res.status(409).json({ message: "option already exists" });
      }

      db.query(
        "INSERT INTO report_comments (reason) VALUES (?)",
        [reason],
        (err, result) => {
          if (err) {
            console.error("Error adding option:", err);
            res.status(500).json({ error: "Failed to add option" });
          } else {
            res.status(201).json({
              message: "option added successfully",
              reportCommentID: result.insertId,
            });
          }
        }
      );
    }
  );
};

const editingCommentOption = (req, res) => {
  const { reportCommentID } = req.params;
  const { reason } = req.body;

  // Check if the option already exists
  db.query(
    "SELECT * FROM report_comments WHERE reason = ?",
    [reason],
    (err, results) => {
      if (err) {
        console.error("Error checking option:", err);
        return res.status(500).json({ error: "Failed to check option" });
      }

      if (results.length > 0) {
        // Subject already exists
        return res.status(409).json({ message: "option already exists" });
      }

      if (reason) {
        db.query(
          "UPDATE report_comments SET reason = ? WHERE reportCommentID = ?",
          [reason, reportCommentID],
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
      } else {
        res.status(400).json({ error: "Reason is required" });
      }
    }
  );
};

const deleteCommentOption = (req, res) => {
  const { reportCommentID } = req.params;

  db.query(
    "DELETE FROM report_comments WHERE reportCommentID = ?",
    [reportCommentID],
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

module.exports = {
  addingCommentOption,
  editingCommentOption,
  deleteCommentOption,
};
