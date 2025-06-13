const express = require("express");
const {
  addingFlaggingOption,
  editingFlaggingOption,
  deleteFlaggingOption,
} = require("../controllers/flaggingOptionController");
const router = express.Router();

router.post("/flaggingOptions", addingFlaggingOption);

router.put("/flaggingEdit/:flagID", editingFlaggingOption);

router.delete("/flaggingDelete/:flagID", deleteFlaggingOption);

module.exports = router;
