const express = require("express");
const {
  fetchingAllUsers,
  fetchingFlaggedUsers,
  fetchingReportedComments,
  fetchingReportedUsers,
} = require("../controllers/analyticsController");

const router = express.Router();

router.get("/userAnalytics", fetchingAllUsers);

router.get("/flaggedAnalytics", fetchingFlaggedUsers);

router.get("/getReportedCommentsAnalytics", fetchingReportedComments);

router.get("/getReportedUsersAnalytics", fetchingReportedUsers);

module.exports = router;
