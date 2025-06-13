const db = require("../database");
const bcrypt = require("bcryptjs");

const fetchFAQ = (req, res) => {
  const query = "SELECT * FROM faq ORDER BY faqID DESC";
  db.query(query, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Failed to fetch FAQs", error: err });
    }
    res.json(results);
  });
};

const addingFAQ = (req, res) => {
  const { question, answer } = req.body;

  // Check if the option already exists
  db.query(
    "SELECT * FROM faq WHERE question = ?",
    [question],
    (err, results) => {
      if (err) {
        console.error("Error checking faq:", err);
        return res.status(500).json({ error: "Failed to check faq" });
      }

      if (results.length > 0) {
        // Subject already exists
        return res.status(409).json({ message: "faq already exists" });
      }

      if (!question || !answer) {
        return res
          .status(400)
          .json({ message: "Question and answer are required" });
      }

      const query = "INSERT INTO faq (question, answer) VALUES (?, ?)";
      db.query(query, [question, answer], (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Failed to add FAQ", error: err });
        }
        res
          .status(201)
          .json({ message: "FAQ added successfully", faqID: result.insertId });
      });
    }
  );
};

const editingFAQ = (req, res) => {
  const faqID = req.params.faqID;
  const { question, answer } = req.body;

  // Check if the option already exists
  db.query(
    "SELECT * FROM faq WHERE question = ?",
    [question],
    (err, results) => {
      if (err) {
        console.error("Error checking faq:", err);
        return res.status(500).json({ error: "Failed to check faq" });
      }

      if (results.length > 0) {
        // Subject already exists
        return res.status(409).json({ message: "faq already exists" });
      }

      if (!question || !answer) {
        return res
          .status(400)
          .json({ message: "Question and answer are required" });
      }

      const query = "UPDATE faq SET question = ?, answer = ? WHERE faqID = ?";
      db.query(query, [question, answer, faqID], (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Failed to update FAQ", error: err });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "FAQ not found" });
        }
        res.json({ message: "FAQ updated successfully" });
      });
    }
  );
};

const deleteFAQ = (req, res) => {
  const faqID = req.params.faqID;

  const query = "DELETE FROM faq WHERE faqID = ?";
  db.query(query, [faqID], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Failed to delete FAQ", error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    res.json({ message: "FAQ deleted successfully" });
  });
};

module.exports = {
  fetchFAQ,
  addingFAQ,
  editingFAQ,
  deleteFAQ,
};
