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

const allowedOrigins = [
  "https://sikat-react-js-backend.vercel.app", // Original domain
  "https://sikat-react-js-iota.vercel.app", // New domain you're requesting from
];

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "sikat-ediary",
});

// const db = mysql.createConnection({
//   host: "sql12.freesqldatabase.com",
//   user: "sql12762009",
//   password: "c9LRMHS1aZ",
//   database: "sql12762009",
// });

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

//admin diary_images upload
const diaryImagesDirAdmin = path.join(
  __dirname,
  "uploads",
  "admin_diary_images"
);

if (!fs.existsSync(diaryImagesDirAdmin)) {
  fs.mkdirSync(diaryImagesDirAdmin, { recursive: true });
}

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

const diaryImageStorageUser = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, diaryImagesDirUser);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadDiaryImageUser = multer({
  storage: diaryImageStorageUser,
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

//profile picture upload
const profilePicturesDir = path.join(__dirname, "uploads", "profile_pictures");

if (!fs.existsSync(profilePicturesDir)) {
  fs.mkdirSync(profilePicturesDir, { recursive: true });
}

const profilePictureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profilePicturesDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadProfilePicture = multer({
  storage: profilePictureStorage,
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

//gender based incidents upload
const genderBasedIncidentsDir = path.join(
  __dirname,
  "uploads",
  "gender_based_incidents"
);

if (!fs.existsSync(genderBasedIncidentsDir)) {
  fs.mkdirSync(genderBasedIncidentsDir, { recursive: true });
}

const uploadSupportingDocuments = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, genderBasedIncidentsDir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error("INVALID_FILE_TYPE");
      error.code = "INVALID_FILE_TYPE";
      return cb(error);
    }
    cb(null, true);
  },
});

const otpStore = {};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "sikatediary@gmail.com",
    pass: "cgggyvzfnwgedpfj",
  },
});

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);

  otpStore[email] = otp;
  console.log(`Sending OTP: ${otp} to email: ${email}`);

  try {
    let info = await transporter.sendMail({
      from: "sikatediary@gmail.com",
      to: email,
      subject: "One-Time Password (OTP) from SIKAT eDiary",
      text: `Your OTP is: ${otp}`,
      html: `
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Document</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f7f7f7;
              color: #333;
              margin: 0;
              padding: 0;
            }
            table {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background-color: #fff;
              border-radius: 8px;
              box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              padding: 20px;
              background-color: #5c0099;
              color: white;
              border-radius: 8px 8px 0 0;
            }
            .content {
              padding: 20px;
              text-align: center;
            }
            .footer {
              text-align: center;
              padding: 10px;
              background-color: #f1f1f1;
              color: #777;
              font-size: 12px;
              border-radius: 0 0 8px 8px;
            }
            img {
              max-width: 100%;
              height: auto;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <table>
            <tr>
              <td class="header">
                <h2>Your OTP from SIKAT eDiary</h2>
              </td>
            </tr>
            <tr>
              <td class="content">
                <p>Hello,</p>
                <p>
                  Thank you for using Sikat eDiary. Your One-Time Password (OTP) is:
                </p>
                <h3 style="font-size: 36px; color: #ffb31a">${otp}</h3>
                <p>
                  This OTP is valid for only one minute. Please use it immediately and
                  keep it confidential. Do not share it with anyone.
                </p>
                  <div
            style="
              background-color: #5c0099;
              border-radius: 0.5rem;
              padding: 1rem 0 1rem 0;
            "
          >
            <img
              src="https://i.postimg.cc/HsFH9HCs/TextLogo.png"
              alt="Animated GIF"
              style="height: 60%; width: 60%; object-fit: cover"
            />
          </div>              
          </td>
            </tr>
            <tr>
              <td class="footer">
                <p>Copyright © 2024 | All rights reserved</p>
              </td>
            </tr>
          </table>
        </body>
      </html>`,
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
    password,
    studentNumber,
    alias,
    sex,
    course,
    year,
  } = req.body;

  const username = cvsuEmail;

  if (
    !firstName ||
    !lastName ||
    !cvsuEmail ||
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

  const getDepartmentIdQuery =
    "SELECT departmentID FROM courses WHERE courseName = ?";
  db.query(getDepartmentIdQuery, [course], (err, results) => {
    if (err) {
      console.error("Error fetching departmentID:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: "Invalid course name" });
    }

    const departmentID = results[0].departmentID;

    const userSql =
      "INSERT INTO user_table (`departmentID`, `firstName`, `lastName`, `cvsuEmail`, `username`, `password`, `studentNumber`, `verificationToken`, `isVerified`, sex, course, year) VALUES (?)";
    const userValues = [
      departmentID,
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
          return res
            .status(500)
            .json({ error: "Error inserting profile data" });
        }

        // Retrieve all admin users
        const adminQuery = "SELECT userID FROM user_table WHERE isAdmin = 1";
        db.query(adminQuery, (err, admins) => {
          if (err) {
            console.error("Error retrieving admin users: ", err);
            return res
              .status(500)
              .json({ error: "Error retrieving admin users" });
          }

          const followQueries = admins.map((admin) => {
            return new Promise((resolve, reject) => {
              const followSql =
                "INSERT INTO followers (userID, followedUserID) VALUES (?, ?)";
              db.query(followSql, [userID, admin.userID], (err) => {
                if (err) reject(err);
                else resolve();
              });
            });
          });

          // Execute all follow queries
          Promise.all(followQueries)
            .then(() => {
              const mailOptions = {
                from: "sikatediary@gmail.com",
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

              res.status(201).json({
                message:
                  "User registered successfully. Automatically followed admins.",
              });
            })
            .catch((err) => {
              console.error("Error following admins: ", err);
              res
                .status(500)
                .json({ error: "Error automatically following admins" });
            });
        });
      });
    });
  });
});

app.get("/getCourses", (req, res) => {
  db.query("SELECT * FROM courses", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.get("/fetchDepartments", (req, res) => {
  db.query("SELECT * FROM course_department", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.get("/fetchDepartmentModerators", (req, res) => {
  const query = `
    SELECT 
      course_department.departmentID, 
      course_department.DepartmentName, 
      user_table.userID, 
      user_table.firstName, 
      user_table.lastName, 
      user_profiles.profile_image, 
      user_profiles.bio
    FROM 
      course_department
    JOIN 
      user_table ON course_department.departmentID = user_table.departmentID
    JOIN 
      user_profiles ON user_table.userID = user_profiles.userID
    WHERE 
      user_table.isAdmin = 2
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
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

    const currentDate = new Date();
    if (user.suspendUntil && new Date(user.suspendUntil) > currentDate) {
      return res.status(403).json({
        error: "Account is suspended.",
        suspendReason: user.suspendReason,
        suspendUntil: user.suspendUntil,
      });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.isSuspended === 1) {
      return res
        .status(403)
        .json({ error: "Account is suspended. Please try again later." });
    }

    const updateStatusSql =
      "UPDATE user_table SET isActive = ? WHERE userID = ?";
    db.query(updateStatusSql, [true, user.userID], (err, result) => {
      if (err) {
        console.error("Error updating user status: ", err);
        return res.status(500).json({ error: "Failed to update user status" });
      }

      return res.json({
        userID: user.userID,
        cvsuEmail: user.cvsuEmail,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        departmentID: user.departmentID,
        profile_image: user.profile_image,
      });
    });
  });
});

app.post("/logout", (req, res) => {
  const { userID } = req.body;

  if (!userID) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const query = "UPDATE user_table SET isActive = 0 WHERE userID = ?";

  db.execute(query, [userID], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error logging out", error: err.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Logged out successfully" });
  });
});

app.post("/update-activity", (req, res) => {
  const { userID, status } = req.body;

  // Update the user's activity status in the database
  const query = "UPDATE user_table SET isActive = ? WHERE userID = ?";

  db.query(query, [status, userID], (err, result) => {
    if (err) {
      console.error("Error updating activity status:", err);
      return res
        .status(500)
        .send({ error: "Failed to update activity status" });
    } else {
      // Check if the update was successful
      if (result.affectedRows > 0) {
        // Broadcast the activity status update to Pusher
        pusher.trigger("admin-channel", "user-activity-event", {
          userID: userID,
          isActive: status,
        });

        // Send success response
        res.send({ success: true });
      } else {
        // Handle case where no rows were affected
        console.error("No user found with the provided userID.");
        res.status(404).send({ error: "User not found" });
      }
    }
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

// const alarmingWords = [
//   "abuse",
//   "violence",
//   "harassment",
//   "threat",
//   "danger",
//   "bullying",
//   "assault",
//   "self-harm",
//   "suicide",
//   "exploitation",
//   "kidnapping",
//   "rape",
//   "murder",
//   "terrorism",
//   "corruption",
//   "abduction",
//   "stalking",
//   "drugs",
//   "addiction",
//   "mental illness",
//   "torture",
//   "domestic violence",
//   "rape culture",
//   "weapon",
//   "hostage",
//   "hate crime",
//   "extortion",
//   "fraud",
//   "trafficking",
//   "radicalization",
//   "criminal activity",
//   "harassment",
//   "discrimination",
//   "sexual assault",
//   "bribery",
//   "defamation",
//   "violence against women",
//   "pedophilia",
//   "domestic abuse",
//   "bullying at school",
//   "cyberbullying",
//   "illegal trafficking",
//   "hate speech",
//   "radical hate",
//   "vigilantism",
//   "trolling",
//   "disappearance",
//   "anxiety",
//   "depression",
//   "addiction to substances",
//   "terroristic threat",
//   "child abuse",
//   "intimidation",
//   "exploitation of minors",
// ];

// const containsAlarmingWords = (text) => {
//   return alarmingWords.some((word) => text.toLowerCase().includes(word));
// };

app.post(
  "/entry",
  (req, res, next) => {
    uploadDiaryImageUser.single("file")(req, res, function (err) {
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
      diary_image = `/uploads/user_diary_images/${file.filename}`;
    }

    db.query("SELECT alarmingWord FROM alarming_words", (err, rows) => {
      if (err) {
        console.error("Error fetching alarming words:", err);
        return res
          .status(500)
          .send({ message: "Error fetching alarming words." });
      }

      const alarmingWords = rows.map((row) => row.alarmingWord.toLowerCase());
      const containsAlarmingWords = (text) => {
        return alarmingWords.some((word) => text.toLowerCase().includes(word));
      };

      const hasAlarmingWords =
        containsAlarmingWords(title) || containsAlarmingWords(description);

      const query = `
        INSERT INTO diary_entries (title, description, userID, visibility, anonimity, diary_image, subjects, containsAlarmingWords, isFlagged)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        title,
        description,
        userID,
        visibility,
        anonimity,
        diary_image,
        subjects,
        hasAlarmingWords ? 1 : 0,
        hasAlarmingWords ? 1 : 0,
      ];

      db.query(query, values, (err, result) => {
        if (err) {
          console.error("Error inserting diary entry:", err);
          return res
            .status(500)
            .send({ message: "Failed to save diary entry. Please try again." });
        }

        const subjectArray =
          subjects && subjects.trim() !== ""
            ? subjects.split(",").map((subject) => subject.trim())
            : [];

        subjectArray.forEach((subject) => {
          const updateQuery = `
            UPDATE filter_subjects
            SET count = count + 1
            WHERE subject = ?
          `;
          db.query(updateQuery, [subject], (updateError) => {
            if (updateError) {
              console.error(
                `Error updating count for subject '${subject}':`,
                updateError
              );
            }
          });
        });

        const userQuery = `
        SELECT u.firstName, u.lastName, up.profile_image 
        FROM user_table u
        JOIN user_profiles up ON u.userID = up.userID
        WHERE u.userID = ?
      `;
        db.query(userQuery, [userID], (userError, userResults) => {
          if (userError) {
            console.error(
              "Error fetching user firstName and profile_image:",
              userError
            );
            return res
              .status(500)
              .send({ message: "Failed to fetch user details." });
          }

          const userFirstName = userResults[0]?.firstName || "User";
          const userLastName = userResults[0]?.lastName || "User";
          const userProfileImage =
            userResults[0]?.profile_image || "/default-profile.png";

          if (hasAlarmingWords) {
            const notificationMessage = `A diary entry containing alarming words has been posted by ${userFirstName} ${userLastName}`;

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
                  INSERT INTO notifications (userID, actorID, message, entryID, type, profile_image)
                  VALUES (?, ?, ?, ?, ?, ?)
                `;
                  db.query(
                    notificationQuery,
                    [
                      admin.userID,
                      userID,
                      notificationMessage,
                      result.insertId,
                      "alarming_entry",
                      userProfileImage, // Include profile image in the notification
                    ],
                    (notificationError) => {
                      if (notificationError) {
                        console.error(
                          "Error inserting admin notification:",
                          notificationError
                        );
                        return res.status(500).send({
                          message: "Failed to save admin notification.",
                        });
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
                            profile_image: userProfileImage, // Include profile image in the notification
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
      });
    });
  }
);

app.put(
  "/editEntry/:entryID",
  (req, res, next) => {
    uploadDiaryImageUser.single("file")(req, res, function (err) {
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
    const { entryID } = req.params;
    const { title, description, visibility, anonimity, subjects } = req.body;
    const file = req.file;

    if (!entryID || !title || !description) {
      return res
        .status(400)
        .send({ message: "Entry ID, title, and description are required." });
    }

    // Fetch the existing diary entry to get the current image (if any)
    const getCurrentImageQuery =
      "SELECT diary_image FROM diary_entries WHERE entryID = ?";
    db.query(getCurrentImageQuery, [entryID], (err, result) => {
      if (err) {
        console.error("Error fetching current diary entry image:", err);
        return res
          .status(500)
          .send({ message: "Error fetching current image." });
      }

      // Get the current image if it exists
      let diary_image = result.length > 0 ? result[0].diary_image : "";

      // If a new file is uploaded, update the image path
      if (file) {
        diary_image = `/uploads/user_diary_images/${file.filename}`;
      }

      db.query("SELECT alarmingWord FROM alarming_words", (err, rows) => {
        if (err) {
          console.error("Error fetching alarming words:", err);
          return res
            .status(500)
            .send({ message: "Error fetching alarming words." });
        }

        const alarmingWords = rows.map((row) => row.alarmingWord.toLowerCase());
        const containsAlarmingWords = (text) => {
          return alarmingWords.some((word) =>
            text.toLowerCase().includes(word)
          );
        };

        const hasAlarmingWords =
          containsAlarmingWords(title) || containsAlarmingWords(description);

        const updateQuery = `
          UPDATE diary_entries
          SET title = ?, description = ?, visibility = ?, anonimity = ?, diary_image = ?, subjects = ?, containsAlarmingWords = ?
          WHERE entryID = ?
        `;
        const values = [
          title,
          description,
          visibility,
          anonimity,
          diary_image || null, // Ensure diary_image is either the new file or the old image
          subjects,
          hasAlarmingWords ? 1 : 0,
          entryID,
        ];

        db.query(updateQuery, values, (err, result) => {
          if (err) {
            console.error("Error updating diary entry:", err);
            return res
              .status(500)
              .send({ message: "Failed to update diary entry." });
          }

          const subjectArray =
            subjects && subjects.trim() !== ""
              ? subjects.split(",").map((subject) => subject.trim())
              : [];

          subjectArray.forEach((subject) => {
            const updateSubjectQuery = `
              UPDATE filter_subjects
              SET count = count + 1
              WHERE subject = ?
            `;
            db.query(updateSubjectQuery, [subject], (updateError) => {
              if (updateError) {
                console.error(
                  `Error updating count for subject '${subject}':`,
                  updateError
                );
              }
            });
          });

          if (hasAlarmingWords) {
            const notificationMessage = `A diary entry containing alarming words has been edited.`;

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
                    INSERT INTO notifications (userID, actorID, message, entryID, type, profile_image)
                    VALUES (?, ?, ?, ?, ?, ?)
                  `;
                  db.query(
                    notificationQuery,
                    [
                      admin.userID,
                      req.body.userID,
                      notificationMessage,
                      entryID,
                      "alarming_entry",
                      "/default-profile.png", // Replace with actual profile image if needed
                    ],
                    (notificationError) => {
                      if (notificationError) {
                        console.error(
                          "Error inserting admin notification:",
                          notificationError
                        );
                        return res.status(500).send({
                          message: "Failed to save admin notification.",
                        });
                      }

                      pusher
                        .trigger(
                          `notifications-${admin.userID}`,
                          "new-notification",
                          {
                            actorID: req.body.userID,
                            message: notificationMessage,
                            entryID: entryID,
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
            message: "Entry updated successfully!",
            containsAlarmingWords: hasAlarmingWords,
          });
        });
      });
    });
  }
);

app.put(
  "/editEntryAdmin/:entryID",
  (req, res, next) => {
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
  },
  (req, res) => {
    const { entryID } = req.params;
    const { title, description, scheduledDate } = req.body; // Include scheduledDate from the request body
    const file = req.file;

    if (!entryID || !title || !description) {
      return res
        .status(400)
        .send({ message: "Entry ID, title, and description are required." });
    }

    let diary_image = "";
    if (file) {
      diary_image = `/uploads/admin_diary_images/${file.filename}`;
    }

    const updateQuery = `
        UPDATE diary_entries
        SET title = ?, description = ?, scheduledDate = ? 
        WHERE entryID = ? 
      `;
    const values = [title, description, scheduledDate || null, entryID]; // Ensure scheduledDate is passed as a value

    db.query(updateQuery, values, (err, result) => {
      if (err) {
        console.error("Error updating diary entry:", err);
        return res
          .status(500)
          .send({ message: "Failed to update diary entry." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).send({ message: "Entry not found." });
      }
      return res
        .status(200)
        .send({ message: "Diary entry updated successfully." });
    });
  }
);

app.post(
  "/entryadmin",
  (req, res, next) => {
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
  },
  (req, res) => {
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
  }
);

app.get("/entries", (req, res) => {
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
});

app.post("/updateEngagement", (req, res) => {
  const { entryID } = req.body;

  if (!entryID) {
    res.status(400).send({ error: "Entry ID is required" });
    return;
  }

  db.query(
    "UPDATE diary_entries SET engagementCount = engagementCount + 1 WHERE entryID = ?",
    [entryID],
    (err, result) => {
      if (err) {
        console.error("Error updating engagement count:", err);
        res.status(500).send({ error: "Failed to update engagement count" });
      } else {
        res.status(200).send({ message: "Engagement count updated" });
      }
    }
  );
});

app.put("/hide", (req, res) => {
  const { entryID } = req.body;

  if (!entryID) {
    res.status(400).send({ error: "Entry ID is required" });
    return;
  }

  db.query(
    "UPDATE diary_entries SET isHide = 1, visibility = 'private'  WHERE entryID = ?",
    [entryID],
    (err, result) => {
      if (err) {
        console.error("Error updating Hide:", err);
        res.status(500).send({ error: "Failed to update Hide" });
      } else {
        res.status(200).send({ message: "Hide updated" });
      }
    }
  );
});

app.put("/isReviewed", (req, res) => {
  const { entryID } = req.body;

  if (!entryID) {
    res.status(400).send({ error: "Entry ID is required" });
    return;
  }

  db.query(
    "UPDATE comment_reports SET isReviewed = 1  WHERE entryID = ?",
    [entryID],
    (err, result) => {
      if (err) {
        console.error("Error updating Hide:", err);
        res.status(500).send({ error: "Failed to update Hide" });
      } else {
        res.status(200).send({ message: "Hide updated" });
      }
    }
  );
});

app.put("/reviewed", (req, res) => {
  const { entryID } = req.body;

  if (!entryID) {
    res.status(400).send({ error: "Entry ID is required" });
    return;
  }

  db.query(
    "UPDATE diary_entries SET isAddress = 1  WHERE entryID = ?",
    [entryID],
    (err, result) => {
      if (err) {
        console.error("Error updating Reviewed:", err);
        res.status(500).send({ error: "Failed to update Reviewed" });
      } else {
        res.status(200).send({ message: "Reviewed updated" });
      }
    }
  );
});

app.put("/isNewAccount", (req, res) => {
  const { userID } = req.body;

  if (!userID) {
    res.status(400).send({ error: "userID ID is required" });
    return;
  }

  db.query(
    "UPDATE user_table SET isNewAccount = 0 WHERE userID = ?",
    [userID],
    (err, result) => {
      if (err) {
        console.error("Error updating Reviewed:", err);
        res.status(500).send({ error: "Failed to update Reviewed" });
      } else {
        res.status(200).send({ message: "Reviewed updated" });
      }
    }
  );
});

app.put("/reviewedProfile/:userID", (req, res) => {
  const { userID } = req.params;

  if (!userID) {
    res.status(400).send({ error: "userID ID is required" });
    return;
  }

  db.query(
    "UPDATE user_table SET isReviewed = 1 WHERE userID = ?",
    [userID],
    (err, result) => {
      if (err) {
        console.error("Error updating Reviewed:", err);
        res.status(500).send({ error: "Failed to update Reviewed" });
      } else {
        res.status(200).send({ message: "Reviewed updated" });
      }
    }
  );
});

app.put("/reviewedComments", (req, res) => {
  const { entryID } = req.body;

  if (!entryID) {
    res.status(400).send({ error: "Entry ID is required" });
    return;
  }

  db.query(
    "UPDATE comment_reports SET isReviewed = 1 WHERE entryID = ?",
    [entryID],
    (err, result) => {
      if (err) {
        console.error("Error updating Reviewed:", err);
        res.status(500).send({ error: "Failed to update Reviewed" });
      } else {
        res.status(200).send({ message: "Reviewed updated" });
      }
    }
  );
});

app.get("/analytics", (req, res) => {
  let query = `
    SELECT 
      diary_entries.*
    FROM diary_entries
    JOIN user_table ON diary_entries.userID = user_table.userID
    JOIN user_profiles ON diary_entries.userID = user_profiles.userID
    WHERE diary_entries.visibility = 'public' AND user_table.isAdmin = 0
    ORDER BY diary_entries.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching diary entries:", err.message);
      return res.status(500).json({ error: "Error fetching diary entries" });
    }
    res.status(200).json(results);
  });
});

// app.get("/analytics", (req, res) => {
//   let query = `
//     SELECT
//       diary_entries.*,
//        user_table.*,
//        user_profiles.profile_image,
//        user_profiles.alias
//     FROM diary_entries
//     JOIN user_table ON diary_entries.userID = user_table.userID
//     JOIN user_profiles ON diary_entries.userID = user_profiles.userID
//     WHERE diary_entries.visibility = 'public' AND user_table.isAdmin = 0
//     ORDER BY diary_entries.created_at DESC
//   `;

//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("Error fetching diary entries:", err.message);
//       return res.status(500).json({ error: "Error fetching diary entries" });
//     }
//     res.status(200).json(results);
//   });
// });

app.get("/analyticsReportedComments", (req, res) => {
  let query = `
    SELECT 
      comments.commentID,
      comment_reports.created_at
    FROM comments
    JOIN comment_reports ON comments.commentID = comment_reports.commentID
    WHERE comments.isReported = 1
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching diary entries:", err.message);
      return res.status(500).json({ error: "Error fetching diary entries" });
    }
    res.status(200).json(results);
  });
});

app.get("/analyticsReportedUsers", (req, res) => {
  let query = `
    SELECT 
      user_table.userID,
      reported_users.created_at
    FROM user_table
    JOIN reported_users ON user_table.userID = reported_users.userID
    WHERE user_table.isReported = 1
  `;

  db.query(query, (err, results) => {
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
      diary_entries.isAnnouncement = 1 
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

  const selectEntryQuery =
    "SELECT diary_image, userID FROM diary_entries WHERE entryID = ?";

  db.query(selectEntryQuery, [entryID], (err, result) => {
    if (err) {
      console.error("Error fetching entry:", err);
      return res.status(500).send("Error fetching the entry.");
    }

    if (result.length === 0) {
      return res.status(404).send("Diary entry not found.");
    }

    const userID = result[0].userID;
    const diaryImagePath = result[0].diary_image;

    const selectAdminQuery = "SELECT isAdmin FROM user_table WHERE userID = ?";

    db.query(selectAdminQuery, [userID], (err, adminResult) => {
      if (err) {
        console.error("Error fetching user info:", err);
        return res.status(500).send("Error fetching user info.");
      }

      if (adminResult.length === 0) {
        return res.status(404).send("User not found.");
      }

      const isAdmin = adminResult[0].isAdmin;
      let imageDirectory = "";

      if (isAdmin === 1) {
        imageDirectory = "admin_diary_images";
      } else {
        imageDirectory = "user_diary_images";
      }

      if (diaryImagePath) {
        const imagePath = path.join(
          __dirname,
          "uploads",
          imageDirectory,
          path.basename(diaryImagePath)
        );

        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error("Error deleting image:", err);
            return res.status(500).send("Error deleting image.");
          }

          console.log("Image deleted successfully.");
        });
      }

      const deleteEntryQuery = "DELETE FROM diary_entries WHERE entryID = ?";

      db.query(deleteEntryQuery, [entryID], (err, result) => {
        if (err) {
          console.error("Error deleting entry:", err);
          res.status(500).send("Error deleting the entry.");
        } else {
          res.status(200).send("Diary entry deleted successfully.");
        }
      });
    });
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

        const updateQuery = `UPDATE diary_entries 
        SET
          gadifyCount = gadifyCount - 1, 
          engagementCount = engagementCount + 1, 
          updated_at = CURRENT_TIMESTAMP  
        WHERE 
          entryID = ?`;
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

app.get("/fetchCourses", (req, res) => {
  const query = `SELECT * 
    FROM courses`;

  db.query(query, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(result[0]); // Merged result since the JOIN already includes profile data
  });
});

app.get("/fetchUserDept&Course/user/:id", (req, res) => {
  const userID = req.params.id;

  console.log("Received Request for User ID:", userID); // ✅ Log User ID

  const userValues = `
    SELECT 
      user_table.userID, 
      course_department.DepartmentName, 
      courses.courseName
    FROM course_department
    JOIN courses ON course_department.departmentID = courses.departmentID 
    JOIN user_table ON user_table.departmentID = course_department.departmentID 
    WHERE user_table.userID = ?`;

  console.log("Executing SQL Query:", userValues); // ✅ Log Query String
  console.log("SQL Parameters:", [userID]); // ✅ Log Query Parameters

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

app.get("/fetchUser/user/:id", (req, res) => {
  const userID = req.params.id;

  const userValues = `
    SELECT 
    user_table.*,
    user_profiles.*,
    course_department.DepartmentName
    FROM user_table
    JOIN user_profiles ON user_table.userID = user_profiles.userID 
    JOIN course_department ON user_table.departmentID = course_department.departmentID 
    WHERE user_table.userID = ?`;

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
});

app.get("/fetchDiaryEntry/:entryID", (req, res) => {
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
      ORDER BY created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err.message);
      return res.status(500).json({ error: "Error fetching users" });
    }
    res.status(200).json(results);
  });
});

app.get("/userAnalytics", (req, res) => {
  const departmentID = req.query.departmentID;

  let query = `
    SELECT u.*
    FROM user_table u
    JOIN course_department c ON u.departmentID = c.departmentID
    WHERE u.departmentID = ?
  `;

  db.query(query, [departmentID], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

app.get("/admin", (req, res) => {
  db.query(
    `
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
      user_table.isAdmin = 1 
    `,
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
    SELECT user_table.userID, user_table.isAdmin, user_table.username, user_table.firstName , user_table.lastName, user_profiles.profile_image
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
      course_department.DepartmentName,
      user_table.username, user_table.firstName, user_table.isAdmin, user_table.isSuspended, user_table.lastName, user_profiles.profile_image
    FROM comments
    INNER JOIN user_table ON comments.userID = user_table.userID
    INNER JOIN user_profiles ON comments.userID = user_profiles.userID
    INNER JOIN course_department ON user_table.departmentID = course_department.departmentID
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
  const { userID, text, entryID, replyCommentID, repliedUserID } = req.body;

  if (!text || !userID || !entryID) {
    return res
      .status(400)
      .json({ error: "User ID, Entry ID, and text are required." });
  }

  const commentQuery =
    "INSERT INTO comments (userID, entryID, text, replyCommentID, repliedUserID) VALUES (?, ?, ?, ?, ?)";
  const updateQuery = `
    UPDATE diary_entries 
    SET 
    engagementCount = engagementCount + 1, 
      updated_at = CURRENT_TIMESTAMP  
    WHERE 
      entryID = ?
  `;

  db.query(
    commentQuery,
    [
      userID,
      entryID,
      text,
      replyCommentID,
      repliedUserID,
      repliedUserID || null,
    ],
    (err, results) => {
      if (err) {
        console.error("Error inserting comment:", err.message);
        return res
          .status(500)
          .json({ error: "Failed to post comment", details: err.message });
      }

      db.query(updateQuery, [entryID], (updateErr) => {
        if (updateErr) {
          console.error("Error updating diary entry timestamp:", updateErr);
          return res
            .status(500)
            .json({ error: "Comment posted, but failed to update timestamp" });
        }

        res.status(201).json({
          message: "Comment posted successfully!",
          commentID: results.insertId,
        });
      });
    }
  );
});

app.post("/reportingUser", (req, res) => {
  const { reportedUserID, reason } = req.body;

  if (!reportedUserID || !reason) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Insert the report into the comment_reports table
  db.query(
    "INSERT INTO reported_users (UserID, reason) VALUES (?,?)",
    [reportedUserID, reason],
    (error, results) => {
      if (error) {
        console.error("Error saving report:", error);
        return res
          .status(500)
          .json({ message: "Error submitting report", error: error.message });
      }

      const reasonArray = reason.split(", ").map((r) => r.trim());

      db.query(
        `UPDATE user_table 
        SET reportCount = reportCount + 1,
        isReported =  1 
        WHERE userID = ?`,
        [reportedUserID],
        (updateError) => {
          if (updateError) {
            console.error(
              `Error updating count for reason: ${reasonItem}`,
              updateError
            );
          }
        }
      );

      // Send response once the main report is saved
      res
        .status(200)
        .json({ message: "Report submitted and counts updated successfully" });
    }
  );
});

app.get("/getReportedUsers", (req, res) => {
  const query = `
    SELECT
      user_table.*,
      user_profiles.profile_image
    FROM 
      user_table
    JOIN user_profiles ON user_table.userID = user_profiles.userID
    WHERE user_table.isReported = 1 AND user_table.isReviewed = 0
    ORDER BY user_table.isReviewed, user_table.reportCount DESC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching reported users:", err.message);
      return res.status(500).json({ error: "Error fetching reported users" });
    }
    res.status(200).json(results);
  });
});

app.get("/getReportedUsersAnalytics", (req, res) => {
  const { departmentID } = req.query;

  // Check if departmentID is provided
  if (!departmentID) {
    return res.status(400).json({ error: "Department ID is required" });
  }

  const query = `
 SELECT
      user_table.*,
      user_profiles.profile_image
    FROM 
      user_table
    JOIN user_profiles ON user_table.userID = user_profiles.userID
    WHERE user_table.isReported = 1 AND user_table.departmentID = ?
    ORDER BY user_table.isReviewed, user_table.reportCount DESC;
  `;

  db.query(query, [departmentID], (err, results) => {
    if (err) {
      console.error("Error fetching reported users:", err.message);
      return res.status(500).json({ error: "Error fetching reported users" });
    }
    res.status(200).json(results);
  });
});

app.get("/fetchReportedUserReasons", (req, res) => {
  db.query("SELECT * FROM reported_users ", (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to retrieve options" });
    } else {
      res.json(results);
    }
  });
});

app.get("/getReportedUser/:userID", (req, res) => {
  const userID = req.params.userID;
  const query = `
    SELECT
      reported_users.*,
      user_table.firstName,
      user_table.lastName,
      user_table.studentNumber,
      user_profiles.profile_image
    FROM 
      reported_users
    JOIN user_table ON reported_users.reportedUserID = user_table.userID
    JOIN user_profiles ON reported_users.userID = user_profiles.userID
    WHERE reported_users.reportedUserID = ?
  `;

  db.query(query, [userID], (err, results) => {
    if (err) {
      console.error("Error fetching reported user:", err.message);
      return res.status(500).json({ error: "Error fetching reported user" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Reported user not found" });
    }

    res.status(200).json(results[0]);
  });
});

app.put("/reportingUsersAddress/:id", (req, res) => {
  const userID = req.params.id;

  const query = `
    UPDATE user_table
    SET isReviewed = 1
    WHERE userID = ?
  `;

  db.query(query, [userID], (err, result) => {
    if (err) {
      console.error("Error updating report status:", err.message);
      return res.status(500).json({ error: "Failed to update report" });
    }
    res
      .status(200)
      .json({ message: "Report marked as addressed successfully" });
  });
});

app.post("/reportuserComment", (req, res) => {
  const { commentID, userID, entryID, reason } = req.body;

  if (!commentID || !userID || !reason) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Insert the report into the comment_reports table
  db.query(
    "INSERT INTO comment_reports (commentID, userID, entryID, reason) VALUES (?, ?, ?, ?)",
    [commentID, userID, entryID, reason],
    (error, results) => {
      if (error) {
        console.error("Error saving report:", error);
        return res
          .status(500)
          .json({ message: "Error submitting report", error: error.message });
      }

      const reasonArray = reason.split(", ").map((r) => r.trim());

      db.query(
        `UPDATE comments 
        SET reportCount = reportCount + 1,
        isReported =  1 
        WHERE commentID = ?`,
        [commentID],
        (updateError) => {
          if (updateError) {
            console.error(
              `Error updating count for reason: ${error}`,
              updateError
            );
          }
        }
      );

      // Send response once the main report is saved
      res
        .status(200)
        .json({ message: "Report submitted and counts updated successfully" });
    }
  );
});

app.get("/fetchReportedCommentReasons", (req, res) => {
  db.query("SELECT * FROM comment_reports ", (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to retrieve options" });
    } else {
      res.json(results);
    }
  });
});

app.get("/getReportedComments", (req, res) => {
  const query = `
  SELECT 
  comments.*,
  user_table.firstName,
  user_table.lastName,
  user_table.studentNumber
  FROM comments
  JOIN user_table ON comments.userID = user_table.userID
  WHERE comments.isReported = 1
  ORDER BY comments.isReviewed, comments.reportCount DESC ;
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

app.get("/getReportedCommentsAnalytics", (req, res) => {
  const departmentID = req.query.departmentID;

  if (!departmentID) {
    return res.status(400).json({ error: "Department ID is required" });
  }

  // SELECT
  // comments.*,
  // user_table.firstName,
  // user_table.lastName,
  // user_table.studentNumber
  // FROM comments
  // JOIN user_table ON comments.userID = user_table.userID
  // WHERE comments.isReported = 1
  // ORDER BY comments.isReviewed, comments.reportCount DESC ;

  const query = `
    SELECT
      comments.*,
      user_table.firstName,
      user_table.lastName,
      user_table.studentNumber,
      diary_entries.*
    FROM 
      comments
    JOIN user_table ON comments.userID = user_table.userID
    JOIN diary_entries ON comments.entryID = diary_entries.entryID
    WHERE comments.isReported = 1 AND user_table.departmentID = ?
    ORDER BY comments.isReviewed, comments.reportCount DESC 
  `;

  db.query(query, [departmentID], (err, results) => {
    if (err) {
      console.error("Error fetching reported comments:", err.message);
      return res
        .status(500)
        .json({ error: "Error fetching reported comments" });
    }
    res.status(200).json(results);
  });
});

// app.get("/getReportedComments/:userID", (req, res) => {
//   const { userID } = req.params;

//   const query = `
//   SELECT
//     comment_reports.*,
//     comments.*,
//     user_table.firstName,
//     user_table.lastName,
//     user_table.studentNumber,
//     user_profiles.profile_image,
//     diary_entries.*
//   FROM
//     comment_reports
//   JOIN user_table ON comment_reports.userID = user_table.userID
//   JOIN comments ON comment_reports.commentID = comments.commentID
//   JOIN user_profiles ON comment_reports.userID = user_profiles.userID
//   JOIN diary_entries ON comment_reports.entryID = diary_entries.entryID
//   WHERE comment_reports.userID = ?`;

//   db.query(query, [userID], (err, results) => {
//     if (err) {
//       console.error("Error fetching reported comments:", err.message);
//       return res
//         .status(500)
//         .json({ error: "Error fetching reported comments" });
//     }
//     res.status(200).json(results);
//   });
// });

app.get("/getReportedCommentsReview/:entryID", (req, res) => {
  const { entryID } = req.params;

  const query = `
  SELECT
    comment_reports.*,
    comments.*,
    diary_entries.*
  FROM 
    comment_reports
  JOIN comments ON comment_reports.entryID = comments.entryID
  JOIN diary_entries ON comment_reports.entryID = diary_entries.entryID
  WHERE comment_reports.entryID = ?`;

  db.query(query, [entryID], (err, results) => {
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

  // First, delete any replies that are linked to this comment
  const deleteRepliesQuery = "DELETE FROM comments WHERE replyCommentID = ?";
  db.query(deleteRepliesQuery, [commentID], (err) => {
    if (err) {
      console.error("Error deleting replies:", err);
      return res.status(500).json({ error: "Failed to delete replies" });
    }

    // Now, delete the comment itself
    const sqlDelete = "DELETE FROM comments WHERE commentID = ?";
    db.query(sqlDelete, [commentID], (err, result) => {
      if (err) {
        console.error("Error deleting comment:", err);
        return res.status(500).json({ error: "Failed to delete comment" });
      }
      return res
        .status(200)
        .json({ message: "Comment and its replies deleted successfully" });
    });
  });
});

app.post("/uploadProfile", uploadProfilePicture.single("file"), (req, res) => {
  const { userID } = req.body;

  if (!userID) {
    console.log("No user ID provided");
    return res.status(400).json({ message: "No user ID provided." });
  }

  if (!req.file) {
    console.log("No file uploaded");
    return res.status(400).json({ message: "No file uploaded." });
  }

  const newFilePath = `/uploads/profile_pictures/${req.file.filename}`;

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

        updateProfileImage(userID, newFilePath, res);
      });
    } else {
      updateProfileImage(userID, newFilePath, res);
    }
  });

  function updateProfileImage(userID, newFilePath, res) {
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

app.post("/submit-report/:userID", (req, res) => {
  uploadSupportingDocuments.array("supportingDocuments", 5)(req, res, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "File upload error: " + err.message });
    }
    const { userID } = req.params;
    const {
      victimName,
      perpetratorName,
      contactInfo,
      gender,
      incidentDescription,
      location,
      date,
      subjects,
      isAddress,
    } = req.body;

    const supportingDocuments = req.files.map(
      (file) => `/uploads/gender_based_incidents/${file.filename}`
    );

    const query = `
      INSERT INTO gender_based_crime_reports 
      (userID, victimName, perpetratorName, contactInfo, gender, incidentDescription, location, date, supportingDocuments, subjects, isAddress) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [
        userID,
        victimName,
        perpetratorName,
        contactInfo,
        gender,
        incidentDescription,
        location,
        date,
        JSON.stringify(supportingDocuments), // Save as JSON string
        subjects,
        false,
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

app.put("/reports/:id", (req, res) => {
  const reportID = req.params.id;

  const query = `
    UPDATE gender_based_crime_reports
    SET isAddress = true
    WHERE reportID = ?
  `;

  db.query(query, [reportID], (err, result) => {
    if (err) {
      console.error("Error updating report status:", err.message);
      return res.status(500).json({ error: "Failed to update report" });
    }
    res
      .status(200)
      .json({ message: "Report marked as addressed successfully" });
  });
});

app.get("/getAddressReports", (req, res) => {
  const query = `
  SELECT * FROM gender_based_crime_reports WHERE isAddress = 1 ORDER BY created_at DESC
`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching reports:", err.message);
      return res.status(500).json({ error: "Error fetching flagged reports" });
    }
    res.status(200).json(results);
  });
});

app.get("/reports", (req, res) => {
  const query = `
  SELECT * FROM gender_based_crime_reports ORDER BY isAddress ASC, created_at DESC
`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching reports:", err.message);
      return res.status(500).json({ error: "Error fetching flagged reports" });
    }
    res.status(200).json(results);
  });
});

app.get("/reports/:reportID", (req, res) => {
  const { reportID } = req.params; // Get reportID from the URL parameters
  const query = `
    SELECT * FROM gender_based_crime_reports
    WHERE reportID = ?`;

  db.query(query, [reportID], (err, results) => {
    if (err) {
      console.error("Error fetching report:", err.message);
      return res.status(500).json({ error: "Error fetching the report" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.status(200).json(results[0]);
  });
});

app.post("/flags", (req, res) => {
  const { userID, entryID, reason } = req.body;

  if (!userID || !entryID || !reason) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  db.query(
    "INSERT INTO flagged_reports (userID, entryID, reason) VALUES ( ?, ?, ?)",
    [userID, entryID, reason],
    (error, results) => {
      if (error) {
        console.error("Error saving report:", error);
        return res
          .status(500)
          .json({ message: "Error submitting report", error: error.message });
      }

      const updateQuery = `
        UPDATE diary_entries 
        SET
        isFlagged = 1,
        engagementCount = engagementCount + 1, 
        flagCount = flagCount + 1, 
          updated_at = CURRENT_TIMESTAMP  
        WHERE 
          entryID = ?
      `;

      db.query(updateQuery, [entryID], (updateError) => {
        if (updateError) {
          console.error("Error updating diary entry timestamp:", updateError);
          return res.status(500).json({
            message: "Report submitted, but failed to update timestamp",
          });
        }

        res.status(200).json({
          message: "Report submitted and counts updated successfully",
        });
      });
    }
  );
});

app.get("/fetchFlaggedDiaryReasons", (req, res) => {
  db.query("SELECT * FROM flagged_reports ", (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to retrieve options" });
    } else {
      res.json(results);
    }
  });
});

app.get("/flagged", (req, res) => {
  const query = `
   SELECT 
    diary_entries.entryID,
    diary_entries.title,
    diary_entries.isFlagged,
    diary_entries.flagCount,
    diary_entries.isAddress,
    user_table.*,
    flagged_reports.created_at,
    user_profiles.profile_image
  FROM diary_entries
  LEFT JOIN user_table ON diary_entries.userID = user_table.userID
  LEFT JOIN user_profiles ON diary_entries.userID = user_profiles.userID
  LEFT JOIN flagged_reports ON diary_entries.entryID = flagged_reports.entryID
  WHERE diary_entries.isFlagged = 1
  ORDER BY diary_entries.isAddress, diary_entries.flagCount DESC ;
`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching reports:", err.message);
      return res.status(500).json({ error: "Error fetching flagged reports" });
    }
    res.status(200).json(results);
  });
});

app.get("/flaggedAnalytics", (req, res) => {
  const departmentID = req.query.departmentID;

  if (!departmentID) {
    return res.status(400).json({ error: "Department ID is required" });
  }

  const query = `
    SELECT 
      diary_entries.entryID,
      diary_entries.title,
      diary_entries.isFlagged,
      diary_entries.flagCount,
      diary_entries.isAddress,
      user_table.departmentID,
      user_table.firstName,
      user_table.lastName,
      user_profiles.profile_image,
      flagged_reports.created_at
    FROM diary_entries
    LEFT JOIN user_table ON diary_entries.userID = user_table.userID
    LEFT JOIN user_profiles ON diary_entries.userID = user_profiles.userID
    LEFT JOIN flagged_reports ON diary_entries.entryID = flagged_reports.entryID
    WHERE diary_entries.isFlagged = 1 AND user_table.departmentID = ?  -- Filter by departmentID
    ORDER BY diary_entries.isAddress, diary_entries.flagCount DESC
  `;

  db.query(query, [departmentID], (err, results) => {
    if (err) {
      console.error("Error fetching reports:", err.message);
      return res.status(500).json({ error: "Error fetching flagged reports" });
    }
    res.status(200).json(results);
  });
});

app.get("/flagged/:userID", (req, res) => {
  const { userID } = req.params; // Get userID from query parameters

  if (!userID) {
    return res.status(400).json({ error: "User ID is required" });
  }

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
  WHERE flagged_reports.userID = ?`;

  db.query(query, [userID], (err, results) => {
    if (err) {
      console.error("Error fetching reports:", err.message);
      return res.status(500).json({ error: "Error fetching flagged reports" });
    }
    res.status(200).json(results);
  });
});

app.get("/flaggedCount/:entryID", (req, res) => {
  const { entryID } = req.params;
  const query = `
    SELECT COUNT(*) AS flaggedCount
    FROM flagged_reports
    WHERE entryID = ?
  `;

  db.query(query, [entryID], (err, results) => {
    if (err) {
      console.error("Error fetching flagged count:", err.message);
      return res.status(500).json({ error: "Error fetching flagged count" });
    }

    const flaggedCount = results[0].flaggedCount;
    res.status(200).json({ flaggedCount });
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

app.put("/notifications/mark-as-read", (req, res) => {
  const { userID, notificationID } = req.body;

  if (!userID || !notificationID) {
    return res
      .status(400)
      .json({ message: "User ID and Notification ID are required." });
  }

  const query = `
    UPDATE notifications
    SET \`read\` = TRUE
    WHERE userID = ? AND notificationID = ?
  `;

  db.query(query, [userID, notificationID], (err, result) => {
    if (err) {
      console.error("Error updating notification:", err);
      return res
        .status(500)
        .json({ message: "Error marking notification as read." });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Notification not found or already marked as read." });
    }

    return res.status(200).json({
      message: "Notification marked as read successfully.",
      updatedCount: result.affectedRows,
    });
  });
});

app.put("/notifications/mark-all-as-read", (req, res) => {
  const { userID } = req.body;

  // Validate request body
  if (!userID) {
    return res.status(400).json({ message: "User ID is required." });
  }

  const query = `
    UPDATE notifications
    SET \`read\` = TRUE
    WHERE userID = ?
  `;

  // Execute the database query
  db.query(query, [userID], (err, result) => {
    if (err) {
      console.error("Error updating notifications:", err);
      return res
        .status(500)
        .json({ message: "Error marking notifications as read." });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "No notifications found for this user." });
    }

    return res.status(200).json({
      message: "All notifications marked as read successfully.",
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

app.get("/adminFilters", (req, res) => {
  db.query("SELECT * FROM admin_filter", (err, results) => {
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

app.get("/alarmingWords", (req, res) => {
  db.query("SELECT * FROM alarming_words", (error, rows) => {
    if (error) {
      console.error("Error fetching alarming words:", error);
      res.status(500).send("Error fetching alarming words");
    } else {
      res.json(rows);
    }
  });
});

app.post("/alarmingWords", (req, res) => {
  const { alarmingWord } = req.body;
  if (alarmingWord) {
    db.query(
      "INSERT INTO alarming_words (alarmingWord) VALUES (?)",
      [alarmingWord],
      (error, result) => {
        if (error) {
          console.error("Error adding alarming word:", error);
          res.status(500).send("Error adding alarming word");
        } else {
          res.json({ wordID: result.insertId, alarmingWord, count: 0 });
        }
      }
    );
  } else {
    res.status(400).send("Alarming word is required");
  }
});

app.put("/alarmingWordEdit/:wordID", (req, res) => {
  const { wordID } = req.params;
  const { alarmingWord } = req.body;
  if (alarmingWord) {
    db.query(
      "UPDATE alarming_words SET alarmingWord = ? WHERE wordID = ?",
      [alarmingWord, wordID],
      (error) => {
        if (error) {
          console.error("Error updating alarming word:", error);
          res.status(500).send("Error updating alarming word");
        } else {
          res.send("Alarming word updated successfully");
        }
      }
    );
  } else {
    res.status(400).send("Alarming word is required");
  }
});

app.delete("/alarmingWordDelete/:wordID", (req, res) => {
  const { wordID } = req.params;
  if (wordID) {
    db.query(
      "DELETE FROM alarming_words WHERE wordID = ?",
      [wordID],
      (error) => {
        if (error) {
          console.error("Error deleting alarming word:", error);
          res.status(500).send("Error deleting alarming word");
        } else {
          res.send("Alarming word deleted successfully");
        }
      }
    );
  } else {
    res.status(400).send("Word ID is required");
  }
});

app.get("/faqs", (req, res) => {
  const query = "SELECT * FROM faq ORDER BY faqID DESC";
  db.query(query, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Failed to fetch FAQs", error: err });
    }
    res.json(results);
  });
});

app.post("/faqs", (req, res) => {
  const { question, answer } = req.body;

  if (!question || !answer) {
    return res
      .status(400)
      .json({ message: "Question and answer are required" });
  }

  const query = "INSERT INTO faq (question, answer) VALUES (?, ?)";
  db.query(query, [question, answer], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Failed to add FAQ", error: err });
    }
    res
      .status(201)
      .json({ message: "FAQ added successfully", faqID: result.insertId });
  });
});

app.put("/faqedit/:faqID", (req, res) => {
  const faqID = req.params.faqID;
  const { question, answer } = req.body;

  if (!question || !answer) {
    return res
      .status(400)
      .json({ message: "Question and answer are required" });
  }

  const query = "UPDATE faq SET question = ?, answer = ? WHERE faqID = ?";
  db.query(query, [question, answer, faqID], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Failed to update FAQ", error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    res.json({ message: "FAQ updated successfully" });
  });
});

app.delete("/faq/:faqID", (req, res) => {
  const faqID = req.params.faqID;

  const query = "DELETE FROM faq WHERE faqID = ?";
  db.query(query, [faqID], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Failed to delete FAQ", error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    res.json({ message: "FAQ deleted successfully" });
  });
});

app.put("/flaggedAddress/:id", (req, res) => {
  const entryID = req.params.id;

  const query = `
    UPDATE diary_entries
    SET isAddress = 1
    WHERE entryID = ?
  `;

  db.query(query, [entryID], (err, result) => {
    if (err) {
      console.error("Error updating flagged status:", err.message);
      return res.status(500).json({ error: "Failed to update flagged" });
    }
    res
      .status(200)
      .json({ message: "Report marked as addressed successfully" });
  });
});

app.put("/commentAddress/:id", (req, res) => {
  const commentID = req.params.id;

  const query = `
    UPDATE comments
    SET isReviewed = 1
    WHERE commentID = ?
  `;

  db.query(query, [commentID], (err, result) => {
    if (err) {
      console.error("Error updating comment status:", err.message);
      return res.status(500).json({ error: "Failed to update comment" });
    }
    res
      .status(200)
      .json({ message: "comment marked as reviewed successfully" });
  });
});

app.post("/reset-password", (req, res) => {
  const { email, password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  // Hash the password before saving
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    "UPDATE user_table SET password = ? WHERE cvsuEmail = ?",
    [hashedPassword, email],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Error resetting password" });
      }

      if (result.affectedRows === 0) {
        return res
          .status(400)
          .json({ error: "No user found with that email address." });
      }

      res.json({ message: "Password reset successfully" });
    }
  );
});

app.post("/api/index-images", upload.single("image"), (req, res) => {
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
});

app.get("/api/index-images", (req, res) => {
  const sql = "SELECT * FROM index_images";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json(results);
  });
});

app.delete("/index-images/:index_imagesID", (req, res) => {
  const { index_imagesID } = req.params;
  const query = "DELETE FROM index_images WHERE index_imagesID = ?";
  db.query(query, [index_imagesID], (err) => {
    if (err) return res.status(500).send("Error deleting image");
    res.status(200).send("Image deleted successfully");
  });
});

app.put("/api/index-images/:index_imagesID", (req, res) => {
  const { index_imagesID } = req.params;
  const { title, description } = req.body;
  const query =
    "UPDATE index_images SET title = ?, description = ? WHERE index_imagesID = ?";
  db.query(query, [title, description, index_imagesID], (err) => {
    if (err) return res.status(500).send("Error updating image");
    res.status(200).send("Image updated successfully");
  });
});

setInterval(() => {
  db.query(
    "UPDATE user_table SET isSuspended = 0, suspendReason = NULL, suspendUntil = NULL WHERE suspendUntil < NOW()",
    (err) => {
      if (err) {
        console.error("Error lifting suspensions:", err);
      } else {
        console.log("Suspensions lifted for eligible users.");
      }
    }
  );
}, 60 * 60 * 1000);

app.post("/suspendUser", (req, res) => {
  const { userID, reason, period, entryID } = req.body;

  const suspendUntil = new Date();
  if (period === "3 Days") suspendUntil.setDate(suspendUntil.getDate() + 3);
  if (period === "3 Weeks") suspendUntil.setDate(suspendUntil.getDate() + 21);
  if (period === "3 Months") suspendUntil.setMonth(suspendUntil.getMonth() + 3);
  if (period === "1 Year")
    suspendUntil.setFullYear(suspendUntil.getFullYear() + 1);

  console.log("Request Body:", req.body);
  console.log("Suspend Until Date:", suspendUntil);

  db.query(
    "UPDATE user_table SET isSuspended = 1, suspendReason = ?, suspendUntil = ? WHERE userID = ?",
    [reason, suspendUntil, userID],
    (err, result) => {
      if (err) {
        console.error("Error suspending user:", err.message);
        res
          .status(500)
          .json({ success: false, error: "Failed to suspend user" });
      } else {
        db.query(
          "INSERT INTO suspensions (userID, reason, suspendUntil) VALUES (?, ?, ?)",
          [userID, reason, suspendUntil],
          (logErr) => {
            if (logErr) {
              console.error("Error logging suspension:", logErr);
            }
          }
        );
      }
    }
  );
  db.query(
    `
    UPDATE user_table SET offenseCount = offenseCount + 1, isReviewed = 1 WHERE userID = ?
    `,
    [userID],
    (err, results) => {
      if (err) {
        console.error("Error updating report count :", err);
        return res.status(500).send("Error updating report count.");
      }
      res.json(results);
    }
  );
});

app.get("/actvity_logs/gadify/:userID", (req, res) => {
  const { userID } = req.params;

  db.query(
    `
    SELECT gadify_actions.*, diary_entries.userID, diary_entries.title, user_table.firstName
    FROM gadify_actions
    JOIN diary_entries ON gadify_actions.entryID = diary_entries.entryID
    JOIN user_table ON diary_entries.userID = user_table.userID
    WHERE gadify_actions.userID = ?
    ORDER BY gadify_actions.created_at DESC
    `,
    [userID],
    (err, results) => {
      if (err) {
        console.error("Error fetching activity logs:", err);
        return res.status(500).send("Error fetching activity logs.");
      }
      res.json(results);
    }
  );
});

app.get("/actvity_logs/comments/:userID", (req, res) => {
  const { userID } = req.params;

  db.query(
    `
    SELECT comments.*, user_table.firstName
    FROM comments
    JOIN user_table ON comments.userID = user_table.userID
    WHERE comments.userID = ?
    ORDER BY comments.created_at DESC
    `,
    [userID],
    (err, results) => {
      if (err) {
        console.error("Error fetching activity logs:", err);
        return res.status(500).send("Error fetching activity logs.");
      }
      res.json(results);
    }
  );
});

app.get("/actvity_logs/flags/:userID", (req, res) => {
  const { userID } = req.params;

  db.query(
    `
    SELECT flagged_reports.*, user_table.firstName
    FROM flagged_reports
    JOIN user_table ON flagged_reports.actorID = user_table.userID
    WHERE flagged_reports.actorID = ?
    ORDER BY flagged_reports.created_at DESC
    `,
    [userID],
    (err, results) => {
      if (err) {
        console.error("Error fetching activity logs:", err);
        return res.status(500).send("Error fetching activity logs.");
      }
      res.json(results);
    }
  );
});

app.get("/filedCases/:userID", (req, res) => {
  const { userID } = req.params;

  db.query(
    `
    SELECT *
    FROM gender_based_crime_reports
    WHERE gender_based_crime_reports.userID = ?
    ORDER BY gender_based_crime_reports.created_at DESC
    `,
    [userID],
    (err, results) => {
      if (err) {
        console.error("Error fetching activity logs:", err);
        return res.status(500).send("Error fetching activity logs.");
      }
      res.json(results);
    }
  );
});

app.post("/saveUserFilters", (req, res) => {
  const { userID, filters } = req.body;

  if (!userID || !filters || !Array.isArray(filters)) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  const insertQuery = `
    INSERT INTO user_filters (userID, filter)
    VALUES (?, ?)
  `;

  let hasError = false;

  filters.forEach((filter, index) => {
    db.query(insertQuery, [userID, filter], (err) => {
      if (err) {
        hasError = true;

        return res.status(500).json({ error: "Error saving user filters" });
      }

      if (index === filters.length - 1 && !hasError) {
        res.status(200).json({ message: "Filters saved successfully" });
      }
    });
  });
});

app.get("/getUserFilters/:userID", (req, res) => {
  const { userID } = req.params;

  if (!userID) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const selectQuery = `
    SELECT filter
    FROM user_filters
    WHERE userID = ?
  `;

  db.query(selectQuery, [userID], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error retrieving user filters" });
    }

    // Instead of 404, return an empty array if no filters are found
    const filters = results.map((row) => row.filter);
    res.status(200).json({ filters: filters.length > 0 ? filters : [] });
  });
});

app.post("/saveUserFilterss", (req, res) => {
  const { userID, filter } = req.body;

  const insertQuery = `
    INSERT INTO user_filters (userID, filter)
    VALUES (?, ?)
  `;

  db.query(insertQuery, [userID, filter], (err) => {
    if (err) {
      return res.status(500).json({ error: "Error saving user filters" });
    } else {
      res.status(200).json({ message: "Filters saved successfully" });
    }
  });
});

app.delete("/deleteUserFilters", (req, res) => {
  const { userID, filter } = req.body;

  db.query(
    "DELETE FROM user_filters WHERE userID = ? AND filter = ?",
    [userID, filter],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete " });
      } else {
        if (result.affectedRows > 0) {
          res.json({ message: " deleted successfully" });
        } else {
          res.status(404).json({ error: "filter not found" });
        }
      }
    }
  );
});

// FOR MANAGING MODERATORS
app.post("/assignModerator", (req, res) => {
  const { userID, departmentID, departmentName } = req.body;

  if (!userID || !departmentID || !departmentName) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const updateQuery = `
    UPDATE user_table 
    SET departmentID = ?, departmentMod = ?, isAdmin = 2 
    WHERE userID = ?
  `;

  db.query(
    updateQuery,
    [departmentID, departmentName, userID],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Moderator assigned successfully!", result });
    }
  );
});

app.post("/removeModerator", (req, res) => {
  const { userID } = req.body;

  if (!userID) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const updateQuery = `
    UPDATE user_table 
    SET  departmentMod = null, isAdmin = 0 
    WHERE userID = ?
  `;

  db.query(updateQuery, [userID], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Moderator successfully removed!", result });
  });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
