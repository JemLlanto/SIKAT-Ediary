const express = require("express");
const router = express.Router();
const {
  fetchFAQ,
  addingFAQ,
  deleteFAQ,
  editingFAQ,
} = require("../controllers/FAQController");

router.get("/faqs", fetchFAQ);

router.post("/faqs", addingFAQ);

router.put("/faqedit/:faqID", editingFAQ);

router.delete("/faq/:faqID", deleteFAQ);

module.exports = router;
