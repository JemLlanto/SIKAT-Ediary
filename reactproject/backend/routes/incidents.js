const express = require("express");
const router = express.Router();
const {
  submitReport,
  addressIncidents,
  fetchAddressedReports,
  fetchIncidents,
  fetchReportsByID,
  fetchReportsByUserID,
} = require("../controllers/incidentsController");

router.post("/submit-report/:userID", submitReport);

router.get("/reports", fetchIncidents);

router.get("/getAddressReports", fetchAddressedReports);

router.get("/reports/:reportID", fetchReportsByID);

router.get("/filedCases/:userID", fetchReportsByUserID);

router.put("/reports/:id", addressIncidents);

module.exports = router;
