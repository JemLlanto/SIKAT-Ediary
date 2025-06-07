const db = require("../database");
const pusher = require("../pusher");

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

module.exports = { loginUser };
