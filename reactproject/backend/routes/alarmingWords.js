const express = require("express");
const {
  fetchAlarmingWords,
  addingAlarmingWordsOption,
  editingAlarmingWordsOption,
  deleteAlarmingWordsOption,
} = require("../controllers/alarmingWordsController");
const router = express.Router();

router.get("/alarmingWords", fetchAlarmingWords);

router.post("/alarmingWords", addingAlarmingWordsOption);

router.put("/alarmingWordEdit/:wordID", editingAlarmingWordsOption);

router.delete("/alarmingWordDelete/:wordID", deleteAlarmingWordsOption);

module.exports = router;
