const express = require("express");
const router = express.Router();

const {
  fetchReportingUsers,
  addingReportingUsersOption,
  editingReportingUsersOption,
  deleteReportingUsersOption,
} = require("../controllers/reportingUserController");

router.get("/reportUsers", fetchReportingUsers);

router.post("/reportUsers", addingReportingUsersOption);

router.put("/reportUsers/:reportedUserID", editingReportingUsersOption);

router.delete("/reportUsers/:reportedUserID", deleteReportingUsersOption);

module.exports = router;
