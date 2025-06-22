const express = require("express");
const {
  fetchingAllUsers,
  fetchingFlaggedUsers,
  fetchingReportedComments,
  fetchingReportedUsers,
} = require("../controllers/analyticsController");

const router = express.Router();

router.get("/userAnalytics/:departmentID", fetchingAllUsers);

router.get("/flaggedAnalytics/:departmentID", fetchingFlaggedUsers);

router.get("/getReportedComments", fetchingReportedComments);

router.get("/getReportedUsersAnalytics/:departmentID", fetchingReportedUsers);

router.get("/getReportedUsers", fetchingReportedUsers);

module.exports = router;
