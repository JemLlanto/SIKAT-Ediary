const db = require("../database");
const bcrypt = require("bcryptjs");

const fetchReportingUsers = (req, res) => {
  db.query("SELECT * FROM reporting_users", (err, results) => {
    if (err) {
      console.error("Error fetching filters:", err);
      res.status(500).json({ error: "Failed to retrieve filters" });
    } else {
      res.json(results);
    }
  });
};

const addingReportingUsersOption = (req, res) => {
  const { reason } = req.body;

  // Check if the option already exists
  db.query(
    "SELECT * FROM reporting_users WHERE reason = ?",
    [reason],
    (err, results) => {
      if (err) {
        console.error("Error checking flagging option:", err);
        return res
          .status(500)
          .json({ error: "Failed to check flagging option" });
      }

      if (results.length > 0) {
        // Subject already exists
        return res
          .status(409)
          .json({ message: "flagging option already exists" });
      }

      db.query(
        "INSERT INTO reporting_users (reason) VALUES (?)",
        [reason],
        (err, result) => {
          if (err) {
            console.error("Error adding filter:", err);
            res.status(500).json({ error: "Failed to add filter" });
          } else {
            res.status(201).json({
              message: "Filter added successfully",
              reportUserID: result.insertId,
            });
          }
        }
      );
    }
  );
};

const editingReportingUsersOption = (req, res) => {
  const { reportedUserID } = req.params;
  const { reason } = req.body;

  // console.log("Editing ID: ", reportedUserID);

  // Check if the option already exists
  db.query(
    "SELECT * FROM reporting_users WHERE reason = ?",
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
          "UPDATE reporting_users SET reason = ? WHERE reportedUserID = ?",
          [reason, reportedUserID],
          (err, result) => {
            if (err) {
              console.error(err);
              res.status(500).json({ error: "Failed to update option" });
            } else {
              if (result.affectedRows > 0) {
                res.json({ message: "option updated successfully" });
              } else {
                res.status(404).json({ error: "option not found" });
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

const deleteReportingUsersOption = (req, res) => {
  const { reportedUserID } = req.params;

  db.query(
    "DELETE FROM reporting_users WHERE reportedUserID = ?",
    [reportedUserID],
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
  fetchReportingUsers,
  addingReportingUsersOption,
  editingReportingUsersOption,
  deleteReportingUsersOption,
};
