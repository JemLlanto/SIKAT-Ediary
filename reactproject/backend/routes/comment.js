const express = require("express");
const router = express.Router();
const {
  addingCommentOption,
  editingCommentOption,
  deleteCommentOption,
} = require("../controllers/commentController");

router.post("/reportComments", addingCommentOption);

router.put("/reportCommentEdit/:reportCommentID", editingCommentOption);

router.delete("/reportCommentDelete/:reportCommentID", deleteCommentOption);

module.exports = router;
