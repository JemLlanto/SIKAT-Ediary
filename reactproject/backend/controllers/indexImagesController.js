const db = require("../database");
const dotenv = require("dotenv");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const diaryCloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "/sikatEdiaryUploads/indexImages",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const uploadDiaryCloudinary = multer({
  storage: diaryCloudinaryStorage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error("INVALID_FILE_TYPE");
      error.code = "INVALID_FILE_TYPE";
      return cb(error);
    }
    cb(null, true);
  },
});

const fetchIndexImages = (req, res) => {
  const sql = "SELECT * FROM index_images";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json(results);
  });
};

const addingIndexImages = (req, res) => {
  const { title, description } = req.body;

  if (!title || !req.file) {
    return res.status(400).json({ error: "Title and image are required" });
  }

  imageUrl = req.file.path;

  const sql =
    "INSERT INTO index_images (title, description, image_path) VALUES (?, ?, ?)";
  db.query(sql, [title, description, imageUrl], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res
      .status(201)
      .json({ message: "Image added successfully", id: result.insertId });
  });
};

const uploadingImage = uploadDiaryCloudinary.single("image");

const deleteIndexImages = (req, res) => {
  const { index_imagesID } = req.params;
  const query = "DELETE FROM index_images WHERE index_imagesID = ?";
  db.query(query, [index_imagesID], (err) => {
    if (err) return res.status(500).send("Error deleting image");
    res.status(200).send("Image deleted successfully");
  });
};

const editingIndexImages = (req, res) => {
  const { index_imagesID } = req.params;
  const { title, description } = req.body;

  // console.log("Editing ID: ", reportedUserID);

  const query =
    "UPDATE index_images SET title = ?, description = ? WHERE index_imagesID = ?";
  db.query(query, [title, description, index_imagesID], (err) => {
    if (err) return res.status(500).send("Error updating image");
    res.status(200).send("Image updated successfully");
  });
};

module.exports = {
  fetchIndexImages,
  uploadingImage,
  addingIndexImages,
  editingIndexImages,
  deleteIndexImages,
};
