const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const fs = require("fs");
const app = express();
const Pusher = require("pusher");
const { profile } = require("console");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

app.use(express.json());

const allowedOrigins = [
  "http://192.168.116.238:5173", // Mobile access
  "http://localhost:5173", // Desktop access
];

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "sikat-ediary",
});

const pusher = new Pusher({
  appId: "1875705",
  key: "4810211a14a19b86f640",
  secret: "e3bd24cb43cd9520c5ca",
  cluster: "ap1",
  useTLS: true,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to database.");
});

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

const upload = multer({ storage });

const otpStore = {};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "ndendi00@gmail.com",
    pass: "kbhjlreosquqajjl",
  },
});

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);

  otpStore[email] = otp;
  console.log(`Sending OTP: ${otp} to email: ${email}`);

  try {
    let info = await transporter.sendMail({
      from: "ndendi00@gmail.com",
      to: email,
      subject: "Your OTP for Registration",
      text: `Your OTP is: ${otp}`,
      // html: `
      // <html>
      //   <head>
      //     <meta charset="utf-8">
      //     <style>
      //       body {
      //         font-family: Arial, sans-serif;
      //         background-color: #f7f7f7;
      //         color: #333;
      //         margin: 0;
      //         padding: 0;
      //       }
      //       table {
      //         width: 100%;
      //         max-width: 600px;
      //         margin: 0 auto;
      //         background-color: #fff;
      //         border-radius: 8px;
      //         box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
      //       }
      //       .header {
      //         text-align: center;
      //         padding: 20px;
      //         background-color: #4CAF50;
      //         color: white;
      //         border-radius: 8px 8px 0 0;
      //       }
      //       .content {
      //         padding: 20px;
      //         text-align: center;
      //       }
      //       .footer {
      //         text-align: center;
      //         padding: 10px;
      //         background-color: #f1f1f1;
      //         color: #777;
      //         font-size: 12px;
      //         border-radius: 0 0 8px 8px;
      //       }
      //       img {
      //         max-width: 100%;
      //         height: auto;
      //         border-radius: 5px;
      //       }
      //     </style>
      //   </head>
      //   <body>
      //     <table>
      //       <tr>
      //         <td class="header">
      //           <h2>Your OTP for Registration</h2>
      //         </td>
      //       </tr>
      //       <tr>
      //         <td class="content">
      //           <p>Hello,</p>
      //           <p>Thank you for registering. Your One-Time Password (OTP) is:</p>
      //           <h3 style="font-size: 36px; color: #4CAF50;">${otp}</h3>
      //           <p>This OTP is valid for a short time. Please use it to complete your registration.</p>
      //           <p>Check out the animation below:</p>
      //           <img src="https://cldup.com/D72zpdwI-i.gif" alt="Animated GIF" />
      //           <p>Enjoy the visual content!</p>
      //         </td>
      //       </tr>
      //       <tr>
      //         <td class="footer">
      //           <p>If you have trouble viewing this email, please check your email client settings.</p>
      //         </td>
      //       </tr>
      //     </table>
      //   </body>
      // </html>`,
    });

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  // Validate input
  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  if (otpStore[email]) {
    const storedOtp = otpStore[email];

    console.log("Comparing received OTP:", otp, "with stored OTP:", storedOtp);

    // Convert both to strings for comparison
    if (String(otp) === String(storedOtp)) {
      return res.json({ success: true });
    } else {
      return res.status(400).json({ error: "Invalid OTP" });
    }
  } else {
    return res.status(400).json({ error: "No OTP found for this email" });
  }
});

app.post("/check-email-username", (req, res) => {
  const { cvsuEmail, username } = req.body;

  if (!cvsuEmail && !username) {
    return res.status(400).json({ message: "Email or username is required" });
  }

  let query = "SELECT COUNT(*) AS count FROM user_table WHERE ";
  let params = [];

  if (cvsuEmail) {
    query += "cvsuEmail = ?";
    params.push(cvsuEmail);
  }

  if (username) {
    if (cvsuEmail) query += " OR ";
    query += "username = ?";
    params.push(username);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error checking email or username:", err);
      return res
        .status(500)
        .json({ message: "Error checking email or username" });
    }

    if (results[0].count > 0) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  });
});

app.post("/Register", (req, res) => {
  const {
    firstName,
    lastName,
    cvsuEmail,
    username,
    password,
    studentNumber,
    alias,
    sex,
    course,
    year,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !cvsuEmail ||
    !username ||
    !password ||
    !studentNumber ||
    !sex ||
    !course ||
    !year
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const verificationToken = crypto.randomBytes(20).toString("hex");
  const otp = Math.floor(100000 + Math.random() * 900000); // Example OTP

  otpStore[cvsuEmail] = otp;

  const hashedPassword = bcrypt.hashSync(password);

  const userSql =
    "INSERT INTO user_table (`firstName`, `lastName`, `cvsuEmail`, `username`, `password`, `studentNumber`, `verificationToken`, `isVerified`, sex, course, year) VALUES (?)";
  const userValues = [
    firstName,
    lastName,
    cvsuEmail,
    username,
    hashedPassword,
    studentNumber,
    verificationToken,
    true,
    sex,
    course,
    year,
  ];

  db.query(userSql, [userValues], (err, data) => {
    if (err) {
      console.error("Error inserting user data: ", err);
      return res.status(500).json({ error: "Error inserting user data" });
    }

    const userID = data.insertId;

    const profileSql =
      "INSERT INTO user_profiles (`userID`, `alias`) VALUES (?, ?)";
    db.query(profileSql, [userID, alias], (err, profileData) => {
      if (err) {
        console.error("Error inserting profile data: ", err);
        return res.status(500).json({ error: "Error inserting profile data" });
      }

      const mailOptions = {
        from: "ndendi00@gmail.com",
        to: cvsuEmail,
        subject: "Your OTP Code",
        text: `Your OTP code is: ${otp}`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Error sending email: ", err);
          return res.status(500).json({ error: "Error sending email" });
        }
        console.log("Verification email sent: " + info.response);
      });

      return res.status(201).json({
        message:
          "User registered successfully. Please check your email to verify your account.",
      });
    });
  });
});

app.get("/verify-email/:token", (req, res) => {
  const { token } = req.params;

  const verifySql = "SELECT * FROM user_table WHERE verificationToken = ?";
  db.query(verifySql, [token], (err, result) => {
    if (err) {
      console.error("Error verifying email: ", err);
      return res.status(500).json({ error: "Error verifying email" });
    }

    if (result.length === 0) {
      return res.status(400).json({ error: "Invalid verification token" });
    }

    const user = result[0];
    const updateSql =
      "UPDATE user_table SET isVerified = 1, verificationToken = NULL WHERE userID = ?";
    db.query(updateSql, [user.userID], (err, updateResult) => {
      if (err) {
        console.error("Error updating user verification status: ", err);
        return res.status(500).json({ error: "Error verifying email" });
      }

      res.status(200).json({ message: "Email verified successfully" });
    });
  });
});

app.post("/Login", (req, res) => {
  const { cvsuEmail, password } = req.body;
  if (!cvsuEmail || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const sql = `
    SELECT user_table.*, user_profiles.profile_image
    FROM user_table
    JOIN user_profiles ON user_table.userID = user_profiles.userID
    WHERE user_table.cvsuEmail = ?
  `;

  db.query(sql, [cvsuEmail], (err, data) => {
    if (err) {
      console.error("Error retrieving data: ", err);
      return res.status(500).json({ error: "Error retrieving data" });
    }
    if (data.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = data[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    return res.json({
      userID: user.userID,
      cvsuEmail: user.cvsuEmail,
      username: user.username,
      isAdmin: user.isAdmin,
      profile_image: user.profile_image,
    });
  });
});

app.put("/EditProfile/:userID", (req, res) => {
  const { userID } = req.params;
  const { firstName, lastName, username, password, bio, alias } = req.body;

  let updateUserSql = `UPDATE user_table SET `;
  const userValues = [];

  if (firstName && firstName.trim()) {
    updateUserSql += `firstName = ?, `;
    userValues.push(firstName);
  }
  if (lastName && lastName.trim()) {
    updateUserSql += `lastName = ?, `;
    userValues.push(lastName);
  }
  if (username && username.trim()) {
    updateUserSql += `username = ?, `;
    userValues.push(username);
  }
  if (password && password.trim()) {
    updateUserSql += `password = ?, `;
    userValues.push(bcrypt.hashSync(password, 10));
  }

  if (userValues.length > 0) {
    updateUserSql = updateUserSql.slice(0, -2);
    updateUserSql += ` WHERE userID = ?`;
    userValues.push(userID);

    db.query(updateUserSql, userValues, (err, userResult) => {
      if (err) {
        console.error("Error updating user: ", err);
        return res.status(500).json({ error: "Failed to update user details" });
      }

      let updateProfileSql = `UPDATE user_profiles SET `;
      const profileValues = [];

      if (bio && bio.trim()) {
        updateProfileSql += `bio = ?, `;
        profileValues.push(bio);
      }
      if (alias && alias.trim()) {
        updateProfileSql += `alias = ?, `;
        profileValues.push(alias);
      }

      if (profileValues.length > 0) {
        updateProfileSql = updateProfileSql.slice(0, -2);
        updateProfileSql += ` WHERE userID = ?`;
        profileValues.push(userID);

        db.query(updateProfileSql, profileValues, (err, profileResult) => {
          if (err) {
            console.error("Error updating profile: ", err);
            return res
              .status(500)
              .json({ error: "Failed to update profile details" });
          }

          return res
            .status(200)
            .json({ message: "Profile updated successfully" });
        });
      } else {
        return res.status(200).json({ message: "User updated successfully" });
      }
    });
  } else {
    return res.status(200).json({ message: "Nothing to update" });
  }
});

const alarmingWords = [
  "abuse",
  "violence",
  "harassment",
  "threat",
  "danger",
  "bullying",
  "assault",
  "self-harm",
  "suicide",
  "exploitation",
  "kidnapping",
  "rape",
  "murder",
  "terrorism",
  "corruption",
  "abduction",
  "stalking",
  "drugs",
  "addiction",
  "mental illness",
  "torture",
  "domestic violence",
  "rape culture",
  "weapon",
  "hostage",
  "hate crime",
  "extortion",
  "fraud",
  "trafficking",
  "radicalization",
  "criminal activity",
  "harassment",
  "discrimination",
  "sexual assault",
  "bribery",
  "defamation",
  "violence against women",
  "pedophilia",
  "domestic abuse",
  "bullying at school",
  "cyberbullying",
  "illegal trafficking",
  "hate speech",
  "radical hate",
  "vigilantism",
  "trolling",
  "disappearance",
  "anxiety",
  "depression",
  "addiction to substances",
  "terroristic threat",
  "child abuse",
  "intimidation",
  "exploitation of minors",
];

const containsAlarmingWords = (text) => {
  return alarmingWords.some((word) => text.toLowerCase().includes(word));
};

app.post(
  "/entry",
  (req, res, next) => {
    upload.single("file")(req, res, function (err) {
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
  },
  (req, res) => {
    const { title, description, userID, visibility, anonimity, subjects } =
      req.body;
    const file = req.file;

    if (!title || !description || !userID) {
      return res
        .status(400)
        .send({ message: "Title, description, and userID are required." });
    }

    let diary_image = "";
    if (file) {
      diary_image = `/uploads/${file.filename}`;
    }

    // Check for alarming words in title or description
    const hasAlarmingWords =
      containsAlarmingWords(title) || containsAlarmingWords(description);

    // Insert diary entry into the database with containsAlarmingWords
    const query = `
      INSERT INTO diary_entries (title, description, userID, visibility, anonimity, diary_image, subjects, containsAlarmingWords)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      title,
      description,
      userID,
      visibility,
      anonimity, // Ensure this value is passed correctly
      diary_image,
      subjects, // Store subjects as plain text
      hasAlarmingWords ? 1 : 0, // Add the flag here (1 = true, 0 = false)
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Error inserting diary entry:", err);
        return res
          .status(500)
          .send({ message: "Failed to save diary entry. Please try again." });
      }

      // Notify admins if alarming words are found
      if (hasAlarmingWords) {
        const notificationMessage = `A diary entry containing alarming words has been posted by user ${userID}`;

        // Query for all users where isAdmin = 1
        const adminQuery = `SELECT userID FROM user_table WHERE isAdmin = 1`;

        db.query(adminQuery, (adminError, adminResults) => {
          if (adminError) {
            console.error("Error fetching admin users:", adminError);
            return res
              .status(500)
              .send({ message: "Failed to notify admins." });
          }

          if (adminResults.length > 0) {
            adminResults.forEach((admin) => {
              const notificationQuery = `
                INSERT INTO notifications (userID, actorID, message, entryID, type)
                VALUES (?, ?, ?, ?, ?)
              `;
              db.query(
                notificationQuery,
                [
                  admin.userID,
                  userID,
                  notificationMessage,
                  result.insertId,
                  "alarming_entry",
                ],
                (notificationError) => {
                  if (notificationError) {
                    console.error(
                      "Error inserting admin notification:",
                      notificationError
                    );
                    return res
                      .status(500)
                      .send({ message: "Failed to save admin notification." });
                  }

                  pusher
                    .trigger(
                      `notifications-${admin.userID}`,
                      "new-notification",
                      {
                        actorID: userID,
                        message: notificationMessage,
                        entryID: result.insertId,
                        type: "alarming_entry",
                        timestamp: new Date().toISOString(),
                      }
                    )
                    .then(() => {
                      console.log(
                        `Admin ${admin.userID} notified of alarming diary entry.`
                      );
                    })
                    .catch((err) => {
                      console.error(
                        "Error sending admin Pusher notification:",
                        err
                      );
                    });
                }
              );
            });
          }
        });
      }

      res.status(200).send({
        message: "Entry added successfully!",
        containsAlarmingWords: hasAlarmingWords,
      });
    });
  }
);

app.post(
  "/entryadmin",
  (req, res, next) => {
    upload.single("file")(req, res, function (err) {
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
  },
  (req, res) => {
    const { title, description, userID } = req.body;
    const file = req.file;

    if (!title || !description || !userID) {
      return res
        .status(400)
        .send({ message: "Title, description, and userID are required." });
    }

    let diary_image = "";
    if (file) {
      diary_image = `/uploads/${file.filename}`;
    }

    const query = `
      INSERT INTO diary_entries (title, description, userID, diary_image)
      VALUES (?, ?, ?, ?)
    `;
    const values = [title, description, userID, diary_image];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Error inserting diary entry:", err);
        return res
          .status(500)
          .send({ message: "Failed to save diary entry. Please try again." });
      }

      res.status(200).send({
        message: "Entry added successfully!",
      });
    });
  }
);

app.get("/entries", (req, res) => {
  const userID = req.query.userID;
  const filters = req.query.filters;

  let query = `
    SELECT 
      diary_entries.*,
      user_table.*,
      user_profiles.profile_image,
      user_profiles.alias
    FROM diary_entries
    JOIN user_table ON diary_entries.userID = user_table.userID
    JOIN user_profiles ON diary_entries.userID = user_profiles.userID
    WHERE (diary_entries.visibility = 'public' 
    OR (diary_entries.visibility = 'private' AND diary_entries.userID = ?))
  `;

  const queryParams = [userID];

  if (Array.isArray(filters) && filters.length > 0) {
    const filterConditions = filters.map((filter) => {
      return `LOWER(diary_entries.subjects) LIKE ?`;
    });

    query += ` AND (${filterConditions.join(" OR ")})`;

    queryParams.push(...filters.map((filter) => `%${filter.toLowerCase()}%`));
  }

  query += ` ORDER BY diary_entries.created_at DESC`;

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching diary entries:", err.message);
      return res.status(500).json({ error: "Error fetching diary entries" });
    }
    res.status(200).json(results);
  });
});

app.get("/announcement", async (req, res) => {
  const query = `
    SELECT 
      diary_entries.*,
      user_table.firstName, 
      user_table.lastName 
    FROM 
      diary_entries
    JOIN 
      user_table 
    ON 
      diary_entries.userID = user_table.userID 
    WHERE 
      user_table.isAdmin = 1 
    ORDER BY 
      diary_entries.created_at DESC 
    LIMIT 1
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching announcement:", error);
      res.status(500).send("Internal Server Error");
    } else if (results.length === 0) {
      res.status(404).send("No announcement found");
    } else {
      res.status(200).json(results[0]); // Send the latest announcement with user info
    }
  });
});

app.delete("/deleteEntry/:entryID", (req, res) => {
  const { entryID } = req.params;

  const deleteQuery = "DELETE FROM diary_entries WHERE entryID = ?";

  db.query(deleteQuery, [entryID], (err, result) => {
    if (err) {
      console.error("Error deleting entry:", err);
      res.status(500).send("Error deleting the entry.");
    } else {
      res.status(200).send("Diary entry deleted successfully.");
    }
  });
});

app.post("/entry/:entryID/gadify", (req, res) => {
  const { entryID } = req.params;
  const userID = req.body.userID;

  const checkQuery = `SELECT * FROM gadify_actions WHERE userID = ? AND entryID = ?`;
  db.query(checkQuery, [userID, entryID], (err, results) => {
    if (err) {
      console.error("Error checking gadify status:", err);
      return res.status(500).json({ error: "Failed to check gadify status" });
    }

    if (results.length > 0) {
      const deleteQuery = `DELETE FROM gadify_actions WHERE userID = ? AND entryID = ?`;
      db.query(deleteQuery, [userID, entryID], (err) => {
        if (err) {
          console.error("Error removing gadify action:", err);
          return res
            .status(500)
            .json({ error: "Failed to remove gadify action" });
        }

        const updateQuery = `UPDATE diary_entries SET gadifyCount = gadifyCount - 1 WHERE entryID = ?`;
        db.query(updateQuery, [entryID], (err) => {
          if (err) {
            console.error("Error updating gadify count:", err);
            return res
              .status(500)
              .json({ error: "Failed to update gadify count" });
          }
          res
            .status(200)
            .json({ message: "Gadify action removed successfully" });
        });
      });
    } else {
      const insertQuery = `INSERT INTO gadify_actions (userID, entryID) VALUES (?, ?)`;
      db.query(insertQuery, [userID, entryID], (err) => {
        if (err) {
          console.error("Error inserting gadify action:", err);
          return res.status(500).json({ error: "Failed to gadify entry" });
        }

        const updateQuery = `UPDATE diary_entries SET gadifyCount = gadifyCount + 1 WHERE entryID = ?`;
        db.query(updateQuery, [entryID], (err) => {
          if (err) {
            console.error("Error updating gadify count:", err);
            return res
              .status(500)
              .json({ error: "Failed to update gadify count" });
          }
          res
            .status(200)
            .json({ message: "Gadify action recorded successfully" });
        });
      });
    }
  });
});

app.get("/gadifyStatus/:userID", (req, res) => {
  const { userID } = req.params;

  const query = `SELECT entryID FROM gadify_actions WHERE userID = ?`;
  db.query(query, [userID], (err, results) => {
    if (err) {
      console.error("Error fetching gadify status:", err);
      return res.status(500).json({ error: "Failed to fetch gadify status" });
    }
    res.status(200).json(results);
  });
});

app.get("/fetchUser/user/:id", (req, res) => {
  const userID = req.params.id;

  const userValues =
    "SELECT * FROM user_table JOIN user_profiles ON user_table.userID = user_profiles.userID WHERE user_table.userID = ?";

  db.query(userValues, [userID], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result[0]); // Merged result since the JOIN already includes profile data
  });
});

app.get("/fetchUserEntry/user/:id", (req, res) => {
  const userID = req.params.id;

  const query = `
    SELECT diary_entries.*, user_table.username, user_table.cvsuEmail, user_profiles.*
    FROM diary_entries 
    INNER JOIN user_table ON diary_entries.userID = user_table.userID 
    INNER JOIN user_profiles ON diary_entries.userID = user_profiles.userID 
    WHERE diary_entries.userID = ?
    ORDER BY diary_entries.created_at DESC`;

  db.query(query, [userID], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    return res.status(200).json({ entries: result });
  });
});

app.get("/fetchDiaryEntry/:entryID", (req, res) => {
  const entryID = req.params.entryID;

  // Assuming you're fetching data from a database
  const query = `SELECT diary_entries.*, user_table.username, user_table.firstName, user_table.lastName, user_profiles.*
    FROM diary_entries 
    INNER JOIN user_table ON diary_entries.userID = user_table.userID 
    INNER JOIN user_profiles ON diary_entries.userID = user_profiles.userID 
    WHERE diary_entries.entryID = ?`;

  db.query(query, [entryID], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.status(200).json({ entry: result[0] });
  });
});

app.get("/users", (req, res) => {
  const query = `
    SELECT 
      user_table.*,
      user_profiles.profile_image
    FROM 
      user_table 
    JOIN 
      user_profiles 
    ON 
      user_table.userID = user_profiles.userID 
    WHERE 
      user_table.isAdmin = 0
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err.message);
      return res.status(500).json({ error: "Error fetching users" });
    }
    res.status(200).json(results);
  });
});

app.get("/admin", (req, res) => {
  db.query(
    "SELECT userID, username FROM user_table WHERE isAdmin = 1 LIMIT 1",
    (err, results) => {
      if (err) {
        return res.status(500).send("Error fetching admin.");
      }
      if (results.length === 0) {
        return res.status(404).send("No admin found.");
      }
      res.json(results[0]);
    }
  );
});

// FOR CHECKING IF THE USER IS ADMIN OR NOT
app.get("/user/:id", (req, res) => {
  const userId = req.params.id;
  const query = "SELECT isAdmin FROM user_table WHERE userID = ?";

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user:", err.message);
      return res.status(500).json({ error: "Error fetching user" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ isAdmin: results[0].isAdmin });
  });
});

app.post("/follow/:followUserId", (req, res) => {
  const { followerId } = req.body;
  const followUserId = req.params.followUserId;

  if (followerId === followUserId) {
    return res.status(400).json({ message: "User cannot follow themselves." });
  }

  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction error:", err);
      return res.status(500).send("Transaction error");
    }

    const checkExistingFollowQuery =
      "SELECT * FROM followers WHERE userID = ? AND followedUserID = ?";
    db.query(
      checkExistingFollowQuery,
      [followerId, followUserId],
      (err, results) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error checking follow relationship:", err);
            res.status(500).send("Error checking follow relationship");
          });
        }

        if (results.length > 0) {
          return res
            .status(400)
            .json({ message: "Already following this user" });
        }

        const followQuery =
          "INSERT INTO followers (userID, followedUserID) VALUES (?, ?)";
        db.query(followQuery, [followerId, followUserId], (err) => {
          if (err) {
            return db.rollback(() => {
              console.error("Error inserting follow relationship:", err);
              res.status(500).send("Error following user");
            });
          }

          const updateFollowedCountQuery =
            "UPDATE user_profiles SET followersCount = followersCount + 1 WHERE userID = ?";
          db.query(updateFollowedCountQuery, [followUserId], (err) => {
            if (err) {
              return db.rollback(() => {
                console.error("Error updating followers count:", err);
                res.status(500).send("Error updating followers count");
              });
            }

            const updateFollowerCountQuery =
              "UPDATE user_profiles SET followingCount = followingCount + 1 WHERE userID = ?";
            db.query(updateFollowerCountQuery, [followerId], (err) => {
              if (err) {
                return db.rollback(() => {
                  console.error("Error updating following count:", err);
                  res.status(500).send("Error updating following count");
                });
              }

              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    console.error("Transaction commit failed:", err);
                    res.status(500).send("Transaction commit failed");
                  });
                }

                res.status(201).json({ message: "User followed successfully" });
              });
            });
          });
        });
      }
    );
  });
});

app.delete("/unfollow/:followUserId", (req, res) => {
  const { followerId } = req.body;
  const followUserId = req.params.followUserId;

  if (followerId === followUserId) {
    return res
      .status(400)
      .json({ message: "User cannot unfollow themselves." });
  }

  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction error:", err);
      return res.status(500).send("Transaction error");
    }

    const checkExistingUnfollowQuery =
      "SELECT * FROM followers WHERE userID = ? AND followedUserID = ?";
    db.query(
      checkExistingUnfollowQuery,
      [followerId, followUserId],
      (err, results) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error checking follow relationship:", err);
            res.status(500).send("Error checking follow relationship");
          });
        }

        if (results.length === 0) {
          return res
            .status(400)
            .json({ message: "User is not following this person" });
        }

        const unfollowQuery =
          "DELETE FROM followers WHERE userID = ? AND followedUserID = ?";
        db.query(unfollowQuery, [followerId, followUserId], (err) => {
          if (err) {
            return db.rollback(() => {
              console.error("Error removing follow relationship:", err);
              res.status(500).send("Error unfollowing user");
            });
          }

          const updateFollowedCountQuery =
            "UPDATE user_profiles SET followersCount = followersCount - 1 WHERE userID = ? AND followersCount > 0";
          db.query(updateFollowedCountQuery, [followUserId], (err) => {
            if (err) {
              return db.rollback(() => {
                console.error("Error updating followers count:", err);
                res.status(500).send("Error updating followers count");
              });
            }

            // Update the follower's following count
            const updateFollowerCountQuery =
              "UPDATE user_profiles SET followingCount = followingCount - 1 WHERE userID = ? AND followingCount > 0";
            db.query(updateFollowerCountQuery, [followerId], (err) => {
              if (err) {
                return db.rollback(() => {
                  console.error("Error updating following count:", err);
                  res.status(500).send("Error updating following count");
                });
              }

              // Commit the transaction
              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    console.error("Transaction commit failed:", err);
                    res.status(500).send("Transaction commit failed");
                  });
                }

                res
                  .status(200)
                  .json({ message: "User unfollowed successfully" });
              });
            });
          });
        });
      }
    );
  });
});

const getFollowedUsersFromDatabase = async (userID) => {
  const query = `
    SELECT user_table.userID, user_table.username, user_table.firstName , user_table.lastName, user_profiles.profile_image
    FROM followers
    INNER JOIN user_table ON followers.followedUserID = user_table.userID
    INNER JOIN user_profiles ON followers.followedUserID = user_profiles.userID
    WHERE followers.userID = ?
  `;

  return new Promise((resolve, reject) => {
    db.query(query, [userID], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

app.get("/followedUsers/:userID", async (req, res) => {
  const userID = req.params.userID;

  try {
    const followedUsers = await getFollowedUsersFromDatabase(userID);
    res.status(200).json(followedUsers);
  } catch (error) {
    console.error("Error fetching followed users:", error);
    res.status(500).json({ error: "Failed to fetch followed users" });
  }
});

const getFollowersFromDatabase = async (userID) => {
  const query = `
    SELECT u.userID, u.username, u.firstName, u.lastName, u.isAdmin, up.profile_image
    FROM followers f
    JOIN user_table u ON f.userID = u.userID
    JOIN user_profiles up ON f.userID = up.userID
    WHERE f.followedUserID = ?
  `;
  return new Promise((resolve, reject) => {
    db.query(query, [userID], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

app.get("/followers/:userID", async (req, res) => {
  const userID = req.params.userID;
  try {
    const followers = await getFollowersFromDatabase(userID);
    res.json(followers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch followers" });
  }
});

app.get("/fetchComments/:entryID", (req, res) => {
  const { entryID } = req.params;
  const query = `
    SELECT 
      comments.commentID, comments.text, comments.created_at, comments.replyCommentID,
      comments.userID,  -- Add this line to fetch userID
      user_table.username, user_table.firstName, user_table.lastName, user_profiles.profile_image
    FROM comments
    INNER JOIN user_table ON comments.userID = user_table.userID
    INNER JOIN user_profiles ON comments.userID = user_profiles.userID
    WHERE comments.entryID = ?
    ORDER BY comments.created_at ASC
  `;

  db.query(query, [entryID], (err, results) => {
    if (err) {
      console.error("Error fetching comments:", err);
      return res.status(500).json({ error: "Failed to fetch comments" });
    }

    res.status(200).json(results);
  });
});

app.post("/comments", (req, res) => {
  const { userID, text, entryID, replyCommentID } = req.body;

  if (!text || !userID || !entryID) {
    return res
      .status(400)
      .json({ error: "User ID, Entry ID, and text are required." });
  }

  const query =
    "INSERT INTO comments (userID, entryID, text, replyCommentID) VALUES (?, ?, ?, ?)";
  db.query(
    query,
    [userID, entryID, text, replyCommentID || null],
    (err, results) => {
      if (err) {
        console.error("Error posting comment:", err);
        return res.status(500).json({ error: "Failed to post comment" });
      }
      res.status(201).json({
        message: "Comment posted successfully!",
        commentID: results.insertId,
      });
    }
  );
});

app.post("/reportuserComment", (req, res) => {
  const { commentID, userID, entryID, reason, otherText } = req.body;

  if (!commentID || !userID || !reason) {
    return res
      .status(400)
      .json({ error: "Comment ID, User ID, and Reason are required" });
  }

  const query = `
    INSERT INTO comment_reports (commentID, userID, entryID, reason, otherText)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [commentID, userID, entryID, reason, otherText || null],
    (err, result) => {
      if (err) {
        console.error("Error reporting comment:", err);
        return res.status(500).json({ error: "Failed to report comment" });
      }

      res.status(200).json({ message: "Report submitted successfully" });
    }
  );
});

app.get("/getReportedComments", (req, res) => {
  const query = `
  SELECT
    comment_reports.*,
    user_table.firstName,
    user_table.lastName,
    user_profiles.profile_image,
    diary_entries.*
  FROM 
    comment_reports
  JOIN user_table ON comment_reports.userID = user_table.userID
  JOIN user_profiles ON comment_reports.userID = user_profiles.userID
  JOIN diary_entries ON comment_reports.entryID = diary_entries.entryID
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching reported comments:", err.message);
      return res
        .status(500)
        .json({ error: "Error fetching reported comments" });
    }
    res.status(200).json(results);
  });
});

app.delete("/deleteComment/:commentID", (req, res) => {
  const commentID = req.params.commentID;

  const sqlDelete = "DELETE FROM comments WHERE commentID = ?";
  db.query(sqlDelete, [commentID], (err, result) => {
    if (err) {
      console.error("Error deleting comment:", err);
      return res.status(500).json({ error: "Failed to delete comment" });
    }
    return res.status(200).json({ message: "Comment deleted successfully" });
  });
});

app.post("/uploadProfile", upload.single("file"), (req, res) => {
  const { userID } = req.body;

  if (!userID) {
    console.log("No user ID provided");
    return res.status(400).json({ message: "No user ID provided." });
  }

  if (!req.file) {
    console.log("No file uploaded");
    return res.status(400).json({ message: "No file uploaded." });
  }

  const newFilePath = `/uploads/${req.file.filename}`;

  const getCurrentProfileQuery =
    "SELECT profile_image FROM user_profiles WHERE userID = ?";

  db.query(getCurrentProfileQuery, [userID], (err, result) => {
    if (err) {
      console.error("Error fetching current profile image:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const currentProfileImage = result[0]?.profile_image;

    if (currentProfileImage) {
      const currentImagePath = path.join(__dirname, currentProfileImage);

      fs.unlink(currentImagePath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("Error deleting current profile image:", err);
          return res
            .status(500)
            .json({ message: "Error deleting current profile image" });
        }

        const updateQuery =
          "UPDATE user_profiles SET profile_image = ? WHERE userID = ?";

        db.query(updateQuery, [newFilePath, userID], (err) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
          }

          console.log("Profile photo uploaded successfully", newFilePath);
          res.json({
            message: "Profile photo uploaded successfully",
            filePath: newFilePath,
          });
        });
      });
    } else {
      const updateQuery =
        "UPDATE user_profiles SET profile_image = ? WHERE userID = ?";

      db.query(updateQuery, [newFilePath, userID], (err) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database error" });
        }

        console.log("Profile photo uploaded successfully", newFilePath);
        res.json({
          message: "Profile photo uploaded successfully",
          filePath: newFilePath,
        });
      });
    }
  });
});

app.post("/message", (req, res) => {
  const { senderID, recipientID, message } = req.body;
  if (!senderID || !recipientID || !message) {
    return res
      .status(400)
      .send("SenderID, recipientID, and message are required.");
  }

  const isAdmin = 1;

  db.query(
    "INSERT INTO messages (senderID, recipientID, message, isAdmin) VALUES (?, ?, ?, ?)",
    [senderID, recipientID, message, isAdmin],
    (err) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send("Error sending message.");
      }

      // Notify all users via Pusher (on the global 'chat-channel')
      pusher.trigger("chat-channel", "message-event", {
        message,
        senderID,
        recipientID, // Send recipientID to filter messages on the client side
      });

      pusher.trigger("admin-channel", "message-event", {
        message,
        senderID,
        recipientID,
      });

      res.status(200).send("Message sent successfully");
    }
  );
});

app.get("/messages", (req, res) => {
  const { userID, withUserID, isAdmin } = req.query;

  if (isAdmin === "1") {
    const query = `
      SELECT * FROM messages
      ORDER BY created_at ASC
    `;

    db.query(query, (err, messages) => {
      if (err) {
        console.error("Error fetching all messages:", err);
        return res.status(500).send("Error fetching all messages.");
      }
      res.json(messages);
    });
  } else {
    // Non-admin request requires userID and withUserID
    if (!userID || !withUserID) {
      return res.status(400).send("userID and withUserID are required.");
    }

    const query = `
      SELECT * FROM messages 
      WHERE (senderID = ? AND recipientID = ?) 
         OR (senderID = ? AND recipientID = ?)
      ORDER BY created_at ASC
    `;

    //   const query = `
    //   SELECT * FROM messages
    //   WHERE (senderID = ? AND recipientID = ?)
    //      OR (senderID = ? AND recipientID = ?)
    //   ORDER BY created_at ASC
    // `;

    db.query(
      query,
      [userID, withUserID, withUserID, userID],
      (err, messages) => {
        if (err) {
          console.error("Error fetching messages:", err);
          return res.status(500).send("Error fetching messages.");
        }
        res.json(messages);
      }
    );
  }
});

app.post("/notifications/:userID", async (req, res) => {
  const { userID } = req.params;
  const { actorID, message, entryID, profile_image, type, isAdmin } = req.body;

  console.log("Request received:", req.body);

  const insertNotificationQuery = `
    INSERT INTO notifications (userID, actorID, message, entryID, profile_image, type)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    insertNotificationQuery,
    [userID, actorID, message, entryID || null, profile_image, type],
    (error, results) => {
      if (error) {
        console.error("Error inserting notification into database:", error);
        return res.status(500).send("Error saving notification");
      }

      // Trigger notification to the specified user or to all users if it's an admin notification
      const channelID =
        isAdmin === 1 ? "notifications-admin" : `notifications-${userID}`;

      pusher
        .trigger(channelID, "new-notification", {
          actorID,
          message,
          entryID: entryID || null,
          profile_image,
          type,
          timestamp: new Date().toISOString(),
        })
        .then(() => {
          console.log("Pusher notification sent");
        })
        .catch((err) => {
          console.error("Error sending Pusher notification:", err);
        });

      res.status(200).send("Notification sent");
    }
  );
});

app.get("/user_profile/:userID", (req, res) => {
  const query = "SELECT * FROM user_profiles WHERE userID = ?";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err.message);
      return res.status(500).json({ error: "Error fetching users" });
    }
    res.status(200).json(results);
  });
});

app.post("/submit-report", (req, res) => {
  upload.single("supportingDocuments")(req, res, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "File upload error: " + err.message });
    }

    const {
      victimName,
      perpetratorName,
      contactInfo,
      gender,
      incidentDescription,
      location,
      date,
      subjects,
    } = req.body;

    const supportingDocuments = req.file ? req.file.filename : null;

    const query = `
      INSERT INTO gender_based_crime_reports 
      (victimName, perpetratorName, contactInfo, gender, incidentDescription, location, date, supportingDocuments, subjects) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)

    `;

    db.query(
      query,
      [
        victimName,
        perpetratorName,
        contactInfo,
        gender,
        incidentDescription,
        location,
        date,
        supportingDocuments,
        subjects,
      ],
      (err, result) => {
        if (err) {
          console.error("Error inserting report:", err.message);
          return res.status(500).json({ error: "Error submitting report" });
        }
        res.status(200).json({ message: "Report submitted successfully" });
      }
    );
  });
});

app.get("/reports", (req, res) => {
  const query = `
  SELECT * FROM gender_based_crime_reports
`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching reports:", err.message);
      return res.status(500).json({ error: "Error fetching flagged reports" });
    }
    res.status(200).json(results);
  });
});

app.post("/flags", (req, res) => {
  const { userID, entryID, behaviors, otherText } = req.body;

  if (!userID || !entryID || !behaviors) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Perform the database query without chaining .then() and .catch()
  const query = db.query(
    "INSERT INTO flagged_reports (userID, entryID, behaviors, other_text) VALUES (?, ?, ?, ?)",
    [userID, entryID, behaviors, otherText || null],
    (error, results) => {
      if (error) {
        console.error("Error saving report:", error);
        res
          .status(500)
          .json({ message: "Error submitting report", error: error.message });
      } else {
        res.status(200).json({ message: "Report submitted successfully" });
      }
    }
  );
});

app.get("/flagged", (req, res) => {
  const query = `
  SELECT 
    flagged_reports.*,
    user_table.firstName,
    user_table.lastName,
    user_table.studentNumber,
    user_table.sex,
    user_profiles.profile_image,
    diary_entries.title
  FROM flagged_reports
  LEFT JOIN user_table ON flagged_reports.userID = user_table.userID
  LEFT JOIN user_profiles ON flagged_reports.userID = user_profiles.userID
  LEFT JOIN diary_entries ON flagged_reports.entryID = diary_entries.entryID
`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching reports:", err.message);
      return res.status(500).json({ error: "Error fetching flagged reports" });
    }
    res.status(200).json(results);
  });
});

app.post("/verify-password/:userID", (req, res) => {
  const { password } = req.body;
  const { userID } = req.params;

  // Validate input
  if (!userID || !password) {
    return res.status(400).json({ error: "User ID and password are required" });
  }

  // SQL query to retrieve the user password from the database
  const sql = `
    SELECT password
    FROM user_table
    WHERE userID = ?
  `;

  db.query(sql, [userID], (err, data) => {
    if (err) {
      console.error("Error retrieving data:", err);
      return res.status(500).json({ error: "Error retrieving data" });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = data[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Respond with success if the password is valid
    return res.json({ message: "Password verified successfully" });
  });
});

app.post("/notifications/mark-as-read", (req, res) => {
  const { userID, notificationID } = req.body;

  if (!userID || !notificationID) {
    return res
      .status(400)
      .json({ message: "User ID and Notification ID are required." });
  }

  const query = `
  UPDATE notifications
  SET read = TRUE
  WHERE userID = ? AND read = FALSE
`;
  db.query(query, [userID, notificationID], (err, result) => {
    if (err) {
      console.error("Error updating notification:", err);
      return res
        .status(500)
        .json({ message: "Error marking notification as read." });
    }

    return res.status(200).json({
      message: "Notification marked as read successfully.",
      updatedCount: result.affectedRows,
    });
  });
});

app.get("/getnotifications/:userID", (req, res) => {
  const { userID } = req.params;

  const fetchNotificationsQuery = `
    SELECT
      notifications.*,
      notifications.profile_image AS actorProfileImage
    FROM
      notifications
    
    WHERE
      notifications.userID = ?
    ORDER BY
      notifications.timestamp DESC
  `;

  db.query(fetchNotificationsQuery, [userID], (error, results) => {
    if (error) {
      console.error("Error fetching notifications from database:", error);
      return res.status(500).send("Error fetching notifications");
    }

    res.status(200).json(results); // Send notifications as JSON response
  });
});

app.put("/editComment/:commentID", (req, res) => {
  const { commentID } = req.params;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: "Comment text is required." });
  }

  const sqlUpdate = "UPDATE comments SET text = ? WHERE commentID = ?";
  db.query(sqlUpdate, [text, commentID], (err, result) => {
    if (err) {
      console.error("Error updating comment:", err);
      return res.status(500).json({ message: "Failed to update comment." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Comment not found." });
    }

    return res.status(200).json({ message: "Comment updated successfully." });
  });
});

// settings
app.post("/flaggingOptions", (req, res) => {
  const { option } = req.body;

  db.query(
    "INSERT INTO flagging_options (reason) VALUES (?)",
    [option],
    (err) => {
      if (err) {
        console.error(err); // Log error details for debugging
        res.status(500).json({ error: "Failed to add option" });
      } else {
        res.status(201).json({ message: "Option added successfully" });
      }
    }
  );
});

app.get("/flaggingOptions", (req, res) => {
  db.query("SELECT * FROM flagging_options", (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to retrieve options" });
    } else {
      res.json(results);
    }
  });
});

app.put("/flaggingEdit/:flagID", (req, res) => {
  const { flagID } = req.params;
  const { reason } = req.body;

  if (reason) {
    db.query(
      "UPDATE flagging_options SET reason = ? WHERE flagID = ?",
      [reason, flagID],
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: "Failed to update option" });
        } else {
          if (result.affectedRows > 0) {
            res.json({ message: "Option updated successfully" });
          } else {
            res.status(404).json({ error: "Option not found" });
          }
        }
      }
    );
  } else {
    res.status(400).json({ error: "Reason is required" });
  }
});

app.delete("/flaggingDelete/:flagID", (req, res) => {
  const { flagID } = req.params;

  db.query(
    "DELETE FROM flagging_options WHERE flagID = ?",
    [flagID],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete option" });
      } else {
        if (result.affectedRows > 0) {
          res.json({ message: "Option deleted successfully" });
        } else {
          res.status(404).json({ error: "Option not found" });
        }
      }
    }
  );
});

app.post("/filters", (req, res) => {
  const { subject } = req.body;

  db.query(
    "INSERT INTO filter_subjects (subject) VALUES (?)",
    [subject],
    (err, result) => {
      if (err) {
        console.error("Error adding filter:", err);
        res.status(500).json({ error: "Failed to add filter" });
      } else {
        res.status(201).json({
          message: "Filter added successfully",
          filterID: result.insertId,
        });
      }
    }
  );
});

app.get("/filters", (req, res) => {
  db.query("SELECT * FROM filter_subjects", (err, results) => {
    if (err) {
      console.error("Error fetching filters:", err);
      res.status(500).json({ error: "Failed to retrieve filters" });
    } else {
      res.json(results);
    }
  });
});

app.put("/filterEdit/:subjectID", (req, res) => {
  const { subjectID } = req.params;
  const { subject } = req.body;

  if (subject) {
    db.query(
      "UPDATE filter_subjects SET subject = ? WHERE subjectID = ?",
      [subject, subjectID],
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: "Failed to update subject" });
        } else {
          if (result.affectedRows > 0) {
            res.json({ message: "Subject updated successfully" });
          } else {
            res.status(404).json({ error: "Subject not found" });
          }
        }
      }
    );
  } else {
    res.status(400).json({ error: "Reason is required" });
  }
});

app.delete("/filterDelete/:subjectID", (req, res) => {
  const { subjectID } = req.params;

  db.query(
    "DELETE FROM filter_subjects WHERE subjectID = ?",
    [subjectID],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete subject" });
      } else {
        if (result.affectedRows > 0) {
          res.json({ message: "Subject deleted successfully" });
        } else {
          res.status(404).json({ error: "Subject not found" });
        }
      }
    }
  );
});

app.post("/reportComments", (req, res) => {
  const { reason } = req.body;

  db.query(
    "INSERT INTO report_comments (reason) VALUES (?)",
    [reason],
    (err, result) => {
      if (err) {
        console.error("Error adding filter:", err);
        res.status(500).json({ error: "Failed to add filter" });
      } else {
        res.status(201).json({
          message: "Filter added successfully",
          reportCommentID: result.insertId,
        });
      }
    }
  );
});

app.get("/reportComments", (req, res) => {
  db.query("SELECT * FROM report_comments", (err, results) => {
    if (err) {
      console.error("Error fetching filters:", err);
      res.status(500).json({ error: "Failed to retrieve filters" });
    } else {
      res.json(results);
    }
  });
});

app.put("/reportCommentEdit/:reportCommentID", (req, res) => {
  const { reportCommentID } = req.params;
  const { reason } = req.body;

  if (reason) {
    db.query(
      "UPDATE report_comments SET reason = ? WHERE reportCommentID = ?",
      [reason, reportCommentID],
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: "Failed to update subject" });
        } else {
          if (result.affectedRows > 0) {
            res.json({ message: "Subject updated successfully" });
          } else {
            res.status(404).json({ error: "Subject not found" });
          }
        }
      }
    );
  } else {
    res.status(400).json({ error: "Reason is required" });
  }
});

app.delete("/reportCommentDelete/:reportCommentID", (req, res) => {
  const { reportCommentID } = req.params;

  db.query(
    "DELETE FROM report_comments WHERE reportCommentID = ?",
    [reportCommentID],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete subject" });
      } else {
        if (result.affectedRows > 0) {
          res.json({ message: "Subject deleted successfully" });
        } else {
          res.status(404).json({ error: "Subject not found" });
        }
      }
    }
  );
});

app.post("/reportUsers", (req, res) => {
  const { reason } = req.body;

  db.query(
    "INSERT INTO reporting_users (reason) VALUES (?)",
    [reason],
    (err, result) => {
      if (err) {
        console.error("Error adding filter:", err);
        res.status(500).json({ error: "Failed to add filter" });
      } else {
        res.status(201).json({
          message: "Filter added successfully",
          reportUserID: result.insertId,
        });
      }
    }
  );
});

app.get("/reportUsers", (req, res) => {
  db.query("SELECT * FROM reporting_users", (err, results) => {
    if (err) {
      console.error("Error fetching filters:", err);
      res.status(500).json({ error: "Failed to retrieve filters" });
    } else {
      res.json(results);
    }
  });
});

app.put("/reportUsers/:reportingUserID", (req, res) => {
  const { reportingUserID } = req.params;
  const { reason } = req.body;

  if (reason) {
    db.query(
      "UPDATE reporting_users SET reason = ? WHERE reportingUserID = ?",
      [reason, reportingUserID],
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: "Failed to update subject" });
        } else {
          if (result.affectedRows > 0) {
            res.json({ message: "Subject updated successfully" });
          } else {
            res.status(404).json({ error: "Subject not found" });
          }
        }
      }
    );
  } else {
    res.status(400).json({ error: "Reason is required" });
  }
});

app.delete("/reportUsers/:reportingUserID", (req, res) => {
  const { reportingUserID } = req.params;

  db.query(
    "DELETE FROM reporting_users WHERE reportingUserID = ?",
    [reportingUserID],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete subject" });
      } else {
        if (result.affectedRows > 0) {
          res.json({ message: "Subject deleted successfully" });
        } else {
          res.status(404).json({ error: "Subject not found" });
        }
      }
    }
  );
});
const host = "0.0.0.0";
const PORT = process.env.PORT || 8081;

app.listen(PORT, host, () => {
  console.log(`Server listening at http://${host}:${PORT}`);
});
