const db = require("../database");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
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

const uploadingImage = upload.single("image");

const addingIndexImages = (req, res) => {
  const { title, description } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  if (!title || !imagePath) {
    return res.status(400).json({ error: "Title and image are required" });
  }

  const sql =
    "INSERT INTO index_images (title, description, image_path) VALUES (?, ?, ?)";
  db.query(sql, [title, description, imagePath], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res
      .status(201)
      .json({ message: "Image added successfully", id: result.insertId });
  });
};

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
