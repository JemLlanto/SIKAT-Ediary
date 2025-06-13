const db = require("../database");
const bcrypt = require("bcryptjs");

const addingFlaggingOption = (req, res) => {
  const { option } = req.body;

  // Check if the option already exists
  db.query(
    "SELECT * FROM flagging_options WHERE reason = ?",
    [option],
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
        "INSERT INTO flagging_options (reason) VALUES (?)",
        [option],
        (err) => {
          if (err) {
            console.error(err); // Log error details for debugging
            res.status(500).json({ error: "Failed to add option" });
          } else {
            res.status(201).json({ message: "Option added successfully" });
          }
        }
      );
    }
  );
};

const editingFlaggingOption = (req, res) => {
  const { flagID } = req.params;
  const { reason } = req.body;

  // Check if the option already exists
  db.query(
    "SELECT * FROM flagging_options WHERE reason = ?",
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

      if (reason) {
        db.query(
          "UPDATE flagging_options SET reason = ? WHERE flagID = ?",
          [reason, flagID],
          (err, result) => {
            if (err) {
              console.error(err);
              res.status(500).json({ error: "Failed to update option" });
            } else {
              if (result.affectedRows > 0) {
                res.json({ message: "Option updated successfully" });
              } else {
                res.status(404).json({ error: "Option not found" });
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

const deleteFlaggingOption = (req, res) => {
  const { flagID } = req.params;

  db.query(
    "DELETE FROM flagging_options WHERE flagID = ?",
    [flagID],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete option" });
      } else {
        if (result.affectedRows > 0) {
          res.json({ message: "Option deleted successfully" });
        } else {
          res.status(404).json({ error: "Option not found" });
        }
      }
    }
  );
};

module.exports = {
  addingFlaggingOption,
  editingFlaggingOption,
  deleteFlaggingOption,
};
