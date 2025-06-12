const express = require("express");
const router = express.Router();
const {
  addFilter,
  editingFilter,
  deletingFilter,
} = require("../controllers/settingsController");

router.post("/filters", addFilter);

router.put("/filterEdit/:subjectID", editingFilter);

router.delete("/filterDelete/:subjectID", deletingFilter);

module.exports = router;
