import React from "react";
import { Bar } from "react-chartjs-2";

const UserDiaryEntryReports = ({
  graphData,
  filteredEntries,
  filteredUsers,
}) => {
  const graphOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Data in weeks (Mon-Sun)",
      },
    },
    scales: {
      y: {
        ticks: {
          stepSize: 1,
          callback: function (value) {
            return Math.floor(value);
          },
        },
      },
    },
  };
  return (
    <div className="row align-items-center gy-2 px-1">
      <div className="col-md d-flex flex-column">
        <div className="row gap-2 px-2">
          <div
            className="col-md-12 border rounded shadow-sm overflow-hidden px-0"
            style={{ height: "clamp(8rem, 20dvw, 9rem)" }}
          >
            <div
              className="text-light d-flex justify-content-center align-items-center gap-2"
              style={{
                background:
                  "linear-gradient(to right, var(--primary_light), var(--primary))",
                height: "clamp(2.5rem, 5dvw, 4rem)",
              }}
            >
              <h2 className="m-0">
                <i className="bx bx-edit"></i>
              </h2>
              <p className="m-0">New diary entries</p>
            </div>
            <div
              className="d-flex align-items-center justify-content-center gap-2"
              style={{ height: "5rem" }}
            >
              <h2 className="m-0">{filteredEntries.length}</h2>
            </div>
          </div>
          <div
            className="col-md-12 border rounded shadow-sm overflow-hidden px-0"
            style={{ height: "clamp(8rem, 20dvw, 9rem)" }}
          >
            <div
              className="text-light d-flex justify-content-center align-items-center gap-2"
              style={{
                background:
                  "linear-gradient(to right, var(--secondary), var(--secondary_hover))",
                height: "clamp(2.5rem, 5dvw, 4rem)",
              }}
            >
              <h2 className="m-0">
                <i className="bx bx-user-plus"></i>
              </h2>
              <p className="m-0">New Users</p>
            </div>
            <div
              className="d-flex align-items-center justify-content-center gap-2"
              style={{ height: "5rem" }}
            >
              <h2 className="m-0">{filteredUsers.length}</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-9">
        <div className="">
          <Bar data={graphData} options={graphOptions} height={300} />
        </div>
      </div>
    </div>
  );
};

export default UserDiaryEntryReports;
