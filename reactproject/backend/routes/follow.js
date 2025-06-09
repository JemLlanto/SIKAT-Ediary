const express = require("express");
const router = express.Router();
const {
  fetchingFollowers,
  fetchingFollowedUsers,
} = require("../controllers/followController");

router.get("/fetchFollowers/:userID", fetchingFollowers);

router.get("/fetchFollowedUsers/:userID", fetchingFollowedUsers);

module.exports = router;
