import React from "react";
import { Link } from "react-router-dom";
import { Doughnut } from "react-chartjs-2";

const Reports = ({
  filteredGenderBasedIncidents,
  filteredFlags,
  filteredReportedComments,
  filteredReportedUsers,
}) => {
  const GenderBaseIncidentsTotal = filteredGenderBasedIncidents.length;

  const uniqueEntryIDs = new Set(filteredFlags.map((flag) => flag.entryID));
  const FlaggedDiariesTotal = uniqueEntryIDs.size;

  const uniqueCommentIDs = new Set(
    filteredReportedComments.map((comment) => comment.commentID)
  );
  const ReportedCommentsTotal = uniqueCommentIDs.size;

  const uniqueReportedUserIDs = new Set(
    filteredReportedUsers.map((user) => user.userID)
  );
  const ReportedUsersTotal = uniqueReportedUserIDs.size;
  const TotalData =
    GenderBaseIncidentsTotal +
    FlaggedDiariesTotal +
    ReportedCommentsTotal +
    ReportedUsersTotal;

  const genderBasedIncidentsDonut = {
    labels: ["Filed Reports", "Other Reports"],
    datasets: [
      {
        data: [GenderBaseIncidentsTotal, TotalData - GenderBaseIncidentsTotal],
        backgroundColor: ["#5c0099", "#ffff"],
        borderColor: ["#ffff"],
        borderWidth: 2,
      },
    ],
  };

  const DonutData = (total, tooltip) => ({
    labels: [tooltip, "Other Reports"],
    datasets: [
      {
        data: [total, TotalData - total],
        backgroundColor: ["#ff3333", "#ffff"],
        borderColor: ["#ffff"],
        borderWidth: 2,
      },
    ],
  });
  const options = {
    responsive: true, // Ensures the chart resizes with the container
    maintainAspectRatio: false, // Allows you to control height & width manually
    plugins: {
      legend: {
        display: false, // Hide legend labels
      },
      tooltip: {
        enabled: true, // Show tooltips on hover
        position: "nearest",
      },
    },
  };

  return (
    <div className="row mt-2 m-auto">
      <Link
        to="/Admin/GenderBasedIncidents"
        className="col-md-6 col-lg dashboardData d-flex align-items-center justify-content-center text-decoration-none border border-2 border-light rounded shadow-sm overflow-hidden p-2"
        style={{
          height: "10rem",
          background:
            "linear-gradient(to right, var(--primary_light), var(--primary))",
        }}
      >
        <div
          className="w-100 d-flex flex-column align-items-center justify-content-center gap-1 p-2"
          style={{ height: "100%", zIndex: "0" }}
        >
          <div
            className="position-relative text-light"
            style={{ height: "80%", width: "80%", objectFit: "contain" }}
          >
            <Doughnut
              className="overflow-visible"
              data={genderBasedIncidentsDonut}
              options={options}
            />
            <h3
              className="m-0 position-absolute "
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                // color: "var(--primary)",
                zIndex: "-1",
              }}
            >
              {GenderBaseIncidentsTotal}
            </h3>
          </div>
          <p
            className="m-0 text-light"
            style={
              {
                //   color: "var(--primary)",
              }
            }
          >
            Gender-Based Incidents Report
          </p>
        </div>
      </Link>
      <Link
        to="/Admin/Analytics/FlaggedDiaries"
        className="col-md-6 col-lg dashboardData d-flex align-items-center justify-content-center text-decoration-none border border-2 border-light rounded shadow-sm overflow-hidden p-2"
        style={{
          height: "10rem",
          background: "linear-gradient(to right, #ff4d4d, #ff3333)",
        }}
      >
        <div
          className="w-100 d-flex flex-column align-items-center justify-content-center gap-1 p-2"
          style={{ height: "100%", zIndex: "0" }}
        >
          <div
            className="position-relative text-light"
            style={{ height: "80%", width: "80%", objectFit: "contain" }}
          >
            <Doughnut
              className="overflow-visible"
              data={DonutData(FlaggedDiariesTotal, "Flagged Diaries")}
              options={options}
            />
            <h3
              className="m-0 position-absolute "
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                // color: "var(--primary)",
                zIndex: "-1",
              }}
            >
              {FlaggedDiariesTotal}
            </h3>
          </div>
          <p
            className="m-0 text-light"
            style={
              {
                //   color: "var(--primary)",
              }
            }
          >
            Flagged Diaries
          </p>
        </div>
      </Link>
      <Link
        to="/Admin/Analytics/ReportedComments"
        className="col-md-6 col-lg dashboardData d-flex align-items-center justify-content-center text-decoration-none border border-2 border-light rounded shadow-sm overflow-hidden p-2"
        style={{
          height: "10rem",
          background: "linear-gradient(to right, #ff4d4d, #ff3333)",
        }}
      >
        <div
          className="w-100 d-flex flex-column align-items-center justify-content-center gap-1 p-2"
          style={{ height: "100%", zIndex: "0" }}
        >
          <div
            className="position-relative text-light"
            style={{ height: "80%", width: "80%", objectFit: "contain" }}
          >
            <Doughnut
              className="overflow-visible"
              data={DonutData(ReportedCommentsTotal, "Reported Comments")}
              options={options}
            />
            <h3
              className="m-0 position-absolute "
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                // color: "var(--primary)",
                zIndex: "-1",
              }}
            >
              {ReportedCommentsTotal}
            </h3>
          </div>
          <p
            className="m-0 text-light"
            style={
              {
                //   color: "var(--primary)",
              }
            }
          >
            Reported Comments
          </p>
        </div>
      </Link>
      <Link
        to="/Admin/Analytics/ReportedUsers"
        className="col-md-6 col-lg dashboardData d-flex align-items-center justify-content-center text-decoration-none border border-2 border-light rounded shadow-sm overflow-hidden p-2"
        style={{
          height: "10rem",
          background: "linear-gradient(to right, #ff4d4d, #ff3333)",
        }}
      >
        <div
          className="w-100 d-flex flex-column align-items-center justify-content-center gap-1 p-2"
          style={{ height: "100%", zIndex: "0" }}
        >
          <div
            className="position-relative text-light"
            style={{ height: "80%", width: "80%", objectFit: "contain" }}
          >
            <Doughnut
              className="overflow-visible"
              data={DonutData(ReportedUsersTotal, "Reported Users")}
              options={options}
            />
            <h3
              className="m-0 position-absolute "
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                // color: "var(--primary)",
                zIndex: "-1",
              }}
            >
              {ReportedUsersTotal}
            </h3>
          </div>
          <p
            className="m-0 text-light"
            style={
              {
                //   color: "var(--primary)",
              }
            }
          >
            Reported Users
          </p>
        </div>
      </Link>
    </div>
  );
};

export default Reports;
