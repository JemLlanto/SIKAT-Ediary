const db = require("../database");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// FUNCTIONS
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

// ROUTES
const fetchIncidents = (req, res) => {
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
};

const fetchAddressedReports = (req, res) => {
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
};

const fetchReportsByID = (req, res) => {
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
};

const fetchReportsByUserID = (req, res) => {
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
};

const submitReport = (req, res) => {
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
};

const addressIncidents = (req, res) => {
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
};

module.exports = {
  fetchIncidents,
  fetchAddressedReports,
  fetchReportsByID,
  fetchReportsByUserID,
  submitReport,
  addressIncidents,
};
