const express = require("express");
const router = express.Router();

const {
  fetchReportingUsers,
  addingReportingUsersOption,
  editingReportingUsersOption,
  deleteReportingUsersOption,
  reportingUser,
} = require("../controllers/reportingUserController");
const { fetchingReportedUsers } = require("../controllers/analyticsController");

router.get("/reportUsers", fetchReportingUsers);

router.post("/reportUsers", addingReportingUsersOption);

router.put("/reportUsers/:reportedUserID", editingReportingUsersOption);

router.delete("/reportUsers/:reportedUserID", deleteReportingUsersOption);

router.post("/reportingUser", reportingUser);

module.exports = router;
