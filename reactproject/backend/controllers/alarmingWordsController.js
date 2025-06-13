const db = require("../database");

const fetchAlarmingWords = (req, res) => {
  db.query("SELECT * FROM alarming_words", (error, rows) => {
    if (error) {
      console.error("Error fetching alarming words:", error);
      res.status(500).send("Error fetching alarming words");
    } else {
      res.json(rows);
    }
  });
};

const addingAlarmingWordsOption = (req, res) => {
  const { alarmingWord } = req.body;

  // Check if the option already exists
  db.query(
    "SELECT * FROM alarming_words WHERE alarmingWord = ?",
    [alarmingWord],
    (err, results) => {
      if (err) {
        console.error("Error checking alarming word:", err);
        return res.status(500).json({ error: "Failed to check alarming word" });
      }

      if (results.length > 0) {
        // Subject already exists
        return res
          .status(409)
          .json({ message: "alarming word already exists" });
      }

      if (alarmingWord) {
        db.query(
          "INSERT INTO alarming_words (alarmingWord) VALUES (?)",
          [alarmingWord],
          (error, result) => {
            if (error) {
              console.error("Error adding alarming word:", error);
              res.status(500).send("Error adding alarming word");
            } else {
              res
                .status(201)
                .json({ wordID: result.insertId, alarmingWord, count: 0 });
            }
          }
        );
      } else {
        res.status(400).send("Alarming word is required");
      }
    }
  );
};

const editingAlarmingWordsOption = (req, res) => {
  const { wordID } = req.params;
  const { alarmingWord } = req.body;

  // Check if the option already exists
  db.query(
    "SELECT * FROM alarming_words WHERE alarmingWord = ?",
    [alarmingWord],
    (err, results) => {
      if (err) {
        console.error("Error checking alarming word:", err);
        return res.status(500).json({ error: "Failed to check alarming word" });
      }

      if (results.length > 0) {
        // Subject already exists
        return res
          .status(409)
          .json({ message: "alarming word already exists" });
      }

      if (alarmingWord) {
        db.query(
          "UPDATE alarming_words SET alarmingWord = ? WHERE wordID = ?",
          [alarmingWord, wordID],
          (error) => {
            if (error) {
              console.error("Error updating alarming word:", error);
              res.status(500).send("Error updating alarming word");
            } else {
              res.send("Alarming word updated successfully");
            }
          }
        );
      } else {
        res.status(400).send("Alarming word is required");
      }
    }
  );
};

const deleteAlarmingWordsOption = (req, res) => {
  const { wordID } = req.params;
  if (wordID) {
    db.query(
      "DELETE FROM alarming_words WHERE wordID = ?",
      [wordID],
      (error) => {
        if (error) {
          console.error("Error deleting alarming word:", error);
          res.status(500).send("Error deleting alarming word");
        } else {
          res.send("Alarming word deleted successfully");
        }
      }
    );
  } else {
    res.status(400).send("Word ID is required");
  }
};

module.exports = {
  fetchAlarmingWords,
  addingAlarmingWordsOption,
  editingAlarmingWordsOption,
  deleteAlarmingWordsOption,
};
