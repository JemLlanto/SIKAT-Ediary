const express = require("express");
const {
  fetchingAllUsers,
  fetchingFlaggedUsers,
  fetchingReportedComments,
  fetchingReportedUsers,
  adminFetchingReportedUsers,
} = require("../controllers/analyticsController");

const router = express.Router();

router.get("/userAnalytics/:departmentID", fetchingAllUsers);

router.get("/flaggedAnalytics/:departmentID", fetchingFlaggedUsers);

router.get(
  "/getReportedCommentsAnalytics/:departmentID",
  fetchingReportedComments
);

router.get("/getReportedUsersAnalytics/:departmentID", fetchingReportedUsers);

router.get("/getReportedUsers", adminFetchingReportedUsers);

module.exports = router;
