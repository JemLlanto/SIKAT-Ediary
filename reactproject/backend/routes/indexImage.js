const express = require("express");
const {
  fetchIndexImages,
  addingIndexImages,
  uploadingImage,
  deleteIndexImages,
  editingIndexImages,
} = require("../controllers/indexImagesController");
const router = express.Router();

router.get("/index-images", fetchIndexImages);

router.post("/index-images", uploadingImage, addingIndexImages);

router.delete("/index-images/:index_imagesID", deleteIndexImages);

router.put("/index-images/:index_imagesID", editingIndexImages);

module.exports = router;
