const db = require("../database");
const Pusher = require("pusher");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const pusher = new Pusher({
  appId: "1875705",
  key: "4810211a14a19b86f640",
  secret: "e3bd24cb43cd9520c5ca",
  cluster: "ap1",
  useTLS: true,
});

// FOR UPLOADING IMAGES
const diaryImageStorageAdmin = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, diaryImagesDirAdmin);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadDiaryImageAdmin = multer({
  storage: diaryImageStorageAdmin,
  limits: { fileSize: 5 * 1024 * 1024 },
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

//user diary_images upload
const diaryImagesDirUser = path.join(__dirname, "uploads", "user_diary_images");

if (!fs.existsSync(diaryImagesDirUser)) {
  fs.mkdirSync(diaryImagesDirUser, { recursive: true });
}

const fetchingEntries = (req, res) => {
  const userID = req.query.userID;
  const filters = req.query.filters;
  const scheduledDate = req.query.scheduledDate === "true";

  let query = `
    SELECT 
      diary_entries.*,
      user_table.firstName,
      user_table.lastName,
      user_table.isAdmin,
      user_table.isSuspended,
      user_table.course,
      user_table.departmentID,
      user_profiles.profile_image,
      user_profiles.alias
    FROM diary_entries
    JOIN user_table ON diary_entries.userID = user_table.userID
    JOIN user_profiles ON diary_entries.userID = user_profiles.userID
    WHERE 
    diary_entries.isHide != 1 AND 
    (diary_entries.visibility = 'public' 
      OR (diary_entries.visibility = 'private' AND diary_entries.userID = ?))
       
  `;

  const queryParams = [userID];

  if (scheduledDate) {
    query += `
      AND (
        diary_entries.isScheduled = 0
        OR (
          diary_entries.isScheduled = 1
          AND diary_entries.scheduledDate <  NOW()
        )
      )
    `;
  }

  if (Array.isArray(filters) && filters.length > 0) {
    const filterConditions = [];

    filters.forEach((filter) => {
      const lowerFilter = filter.toLowerCase(); // Convert once for consistency

      if (lowerFilter === "flagged diaries") {
        // All lowercase
        filterConditions.push(`diary_entries.isFlagged = 1`);
      } else if (lowerFilter === "with alarming words") {
        // All lowercase
        filterConditions.push(`diary_entries.containsAlarmingWords = 1`);
      } else if (lowerFilter !== "general") {
        filterConditions.push(`LOWER(diary_entries.subjects) LIKE ?`);
        queryParams.push(`%${lowerFilter}%`);
      }
    });

    if (filterConditions.length > 0) {
      query += ` AND (${filterConditions.join(" OR ")})`;
    }

    console.log("Filter conditions:", filterConditions); // This should now log correctly
  }

  query += ` 
    ORDER BY 
      GREATEST(
        IFNULL(diary_entries.updated_at, diary_entries.created_at), 
        diary_entries.created_at
      ) DESC, 
      diary_entries.engagementCount DESC
  `;

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching diary entries:", err.message);
      return res.status(500).json({ error: "Error fetching diary entries" });
    }

    // Notify all users about scheduled entries
    const notifyAllUsersQuery = `
      SELECT 
        diary_entries.entryID,
        diary_entries.title,
        diary_entries.scheduledDate,
        diary_entries.isScheduled,
        user_profiles.profile_image,
        CONCAT(user_table.firstName, ' ', user_table.lastName) AS actorName
      FROM diary_entries
      JOIN user_table ON diary_entries.userID = user_table.userID
      JOIN user_profiles ON diary_entries.userID = user_profiles.userID
      WHERE diary_entries.isScheduled = 1 AND diary_entries.scheduledDate <= NOW()
    `;

    db.query(notifyAllUsersQuery, (notifyErr, notifyResults) => {
      if (notifyErr) {
        console.error("Error fetching scheduled entries:", notifyErr.message);
        return res
          .status(500)
          .json({ error: "Error processing notifications" });
      }

      if (notifyResults.length > 0) {
        notifyResults.forEach((entry) => {
          const message = `${entry.actorName} has just published a new diary entry titled "${entry.title}"`;
          const profile_image = entry.profile_image;
          const entryID = entry.entryID;

          const getAllUsersQuery = `
            SELECT userID FROM user_table WHERE isAdmin = 0
          `;

          db.query(getAllUsersQuery, (userErr, users) => {
            if (userErr) {
              console.error("Error fetching users:", userErr.message);
              return;
            }

            users.forEach((user) => {
              const userID = user.userID;
              let admin = 29;
              let actorID = admin;

              const insertNotificationQuery = `
                INSERT INTO notifications (userID, actorID, message, entryID, profile_image, type)
                VALUES (?, ?, ?, ?, ?, ?)
              `;

              db.query(
                insertNotificationQuery,
                [userID, actorID, message, entryID, profile_image, "entry"],
                (insertErr) => {
                  if (insertErr) {
                    console.error(
                      "Error inserting notification:",
                      insertErr.message
                    );
                    return;
                  }

                  // Trigger notification via Pusher
                  pusher
                    .trigger(`notifications-${userID}`, "new-notification", {
                      actorID,
                      message,
                      entryID,
                      profile_image,
                      type: "entry",
                      timestamp: new Date().toISOString(),
                    })
                    .catch((pusherErr) => {
                      console.error(
                        "Error sending Pusher notification:",
                        pusherErr
                      );
                    });
                }
              );
            });
          });
        });

        // Mark entries as no longer scheduled
        const markAsNotScheduledQuery = `
          UPDATE diary_entries
          SET isScheduled = 0
          WHERE entryID IN (${notifyResults
            .map((entry) => entry.entryID)
            .join(",")})
        `;

        db.query(markAsNotScheduledQuery, (updateErr) => {
          if (updateErr) {
            console.error(
              "Error updating scheduled entries:",
              updateErr.message
            );
          } else {
            console.log("Scheduled entries updated to not scheduled.");
          }
        });
      }
    });

    res.status(200).json(results);
  });
};

const fetchingUserEntries = (req, res) => {
  const userID = req.params.id;
  const scheduledDate = req.query.scheduledDate === "true";

  let query = `
    SELECT
      diary_entries.*,
      user_table.firstName,
      user_table.lastName,
      user_table.isAdmin,
      user_table.isSuspended,
      user_table.course,
      user_table.departmentID,
      user_profiles.profile_image,
      user_profiles.alias
    FROM diary_entries
      JOIN user_table ON diary_entries.userID = user_table.userID
      JOIN user_profiles ON diary_entries.userID = user_profiles.userID
    WHERE diary_entries.userID = ?
    
  `;

  if (!scheduledDate) {
    query += `
      AND (
        diary_entries.isScheduled = 0
        OR (
          diary_entries.isScheduled = 1
          AND diary_entries.scheduledDate <  NOW()
        )
      )
    `;
  }

  query += `ORDER BY diary_entries.created_at DESC`;

  db.query(query, [userID], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    return res.status(200).json({ entries: result });
  });
};

const fetchSingleEntry = (req, res) => {
  const entryID = req.params.entryID;

  const query = `
  SELECT diary_entries.*, 
         user_table.isAdmin, 
         user_table.isSuspended, 
         user_table.firstName, 
         user_table.lastName, 
         user_table.course, 
         user_profiles.*, 
         flagged_reports.isReviewed
  FROM diary_entries 
  INNER JOIN user_table ON diary_entries.userID = user_table.userID 
  INNER JOIN user_profiles ON diary_entries.userID = user_profiles.userID 
  LEFT JOIN flagged_reports ON diary_entries.entryID = flagged_reports.entryID 
  WHERE diary_entries.entryID = ?
`;

  db.query(query, [entryID], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.status(200).json({ entry: result[0] });
  });
};

const uploadImageForAdminEntry = (req, res, next) => {
  uploadDiaryImageAdmin.single("file")(req, res, function (err) {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .send({ message: "File size is too large. Maximum 5MB allowed." });
      }
      if (err.code === "INVALID_FILE_TYPE") {
        return res
          .status(400)
          .send({ message: "Only image files are allowed." });
      }
      return res.status(500).send({ message: "File upload error." });
    }
    next();
  });
};

const insertAdminPost = (req, res) => {
  const {
    isAnnouncement,
    title,
    description,
    userID,
    anonimity = "public",
    scheduledDate,
  } = req.body;
  const file = req.file;

  // Validate required fields
  if (!title || !description || !userID) {
    return res
      .status(400)
      .send({ message: "Title, description, and userID are required." });
  }

  let diary_image = "";
  if (file) {
    diary_image = `/uploads/admin_diary_images/${file.filename}`;
  }

  const isScheduled = scheduledDate ? 1 : 0;

  const query = `
      INSERT INTO diary_entries (isAnnouncement, title, description, userID, diary_image, anonimity, scheduledDate, isScheduled)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
  const values = [
    isAnnouncement,
    title,
    description,
    userID,
    diary_image,
    anonimity,
    scheduledDate,
    isScheduled,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error inserting diary entry:", err);
      return res
        .status(500)
        .send({ message: "Failed to save diary entry. Please try again." });
    }

    res.status(200).send({
      message: isScheduled
        ? "Entry scheduled successfully!"
        : "Entry published successfully!",
    });
  });
};

module.exports = {
  fetchingEntries,
  fetchingUserEntries,
  fetchSingleEntry,
  uploadImageForAdminEntry,
  insertAdminPost,
};
