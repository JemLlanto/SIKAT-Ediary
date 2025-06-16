const db = require("../database");
const dotenv = require("dotenv");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

dotenv.config();

// FUNCTIONS
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for regular uploads
const profileCloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "/sikatEdiaryUploads/profile",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const uploadProfileCloudinary = multer({ storage: profileCloudinaryStorage });

const uploadToCloudinary = uploadProfileCloudinary.single("file");

// Helper function to extract public_id from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
  try {
    // Example URL: https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/sikatEdiaryUploads/profile/filename.jpg
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;

    // Get everything after 'upload' and version (if exists)
    let pathParts = parts.slice(uploadIndex + 1);

    // Remove version if it exists (starts with 'v' followed by numbers)
    if (pathParts[0] && pathParts[0].match(/^v\d+$/)) {
      pathParts = pathParts.slice(1);
    }

    // Join the remaining parts and remove file extension
    const publicId = pathParts.join("/").replace(/\.[^/.]+$/, "");
    return publicId;
  } catch (error) {
    console.error("Error extracting public_id from URL:", error);
    return null;
  }
};

// Helper function to delete image from Cloudinary
const deleteFromCloudinary = (url) => {
  return new Promise((resolve, reject) => {
    const publicId = extractPublicIdFromUrl(url);

    if (!publicId) {
      console.log("Could not extract public_id from URL:", url);
      resolve(); // Don't reject, just continue
      return;
    }

    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error("Error deleting from Cloudinary:", error);
        reject(error);
      } else {
        console.log("Successfully deleted from Cloudinary:", result);
        resolve(result);
      }
    });
  });
};

const uploadProfile = async (req, res) => {
  const { userID } = req.body;

  if (!userID) {
    console.log("No user ID provided");
    return res.status(400).json({ message: "No user ID provided." });
  }

  if (!req.file) {
    console.log("No file uploaded");
    return res.status(400).json({ message: "No file uploaded." });
  }

  // File info from Cloudinary
  const fileInfo = {
    url: req.file.path, // Cloudinary URL
  };

  const getCurrentProfileQuery =
    "SELECT profile_image FROM user_profiles WHERE userID = ?";

  db.query(getCurrentProfileQuery, [userID], async (err, result) => {
    if (err) {
      console.error("Error fetching current profile image:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const currentProfileImage = result[0]?.profile_image;

    // If there's a current profile image, delete it from Cloudinary
    if (currentProfileImage) {
      try {
        await deleteFromCloudinary(currentProfileImage);
        console.log("Previous profile image deleted from Cloudinary");
      } catch (error) {
        console.error(
          "Failed to delete previous image from Cloudinary:",
          error
        );
        // Continue with the upload even if deletion fails
      }
    }

    // Update the database with the new image URL
    updateProfileImage(userID, fileInfo.url, res);
  });

  function updateProfileImage(userID, url, res) {
    const updateQuery =
      "UPDATE user_profiles SET profile_image = ? WHERE userID = ?";

    db.query(updateQuery, [url, userID], (err) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      console.log("Profile photo uploaded successfully", url);
      res.json({
        message: "Profile photo uploaded successfully",
        filePath: url,
      });
    });
  }
};

module.exports = { uploadToCloudinary, uploadProfile };
