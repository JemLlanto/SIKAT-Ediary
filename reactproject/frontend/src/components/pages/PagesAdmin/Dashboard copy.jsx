import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Pagination from "react-bootstrap/Pagination";
import MainLayout from "../../Layouts/MainLayout";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [flags, setFlags] = useState([]);
  const [reportedComments, setReportedComments] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState("Year");
  const [specificDate, setSpecificDate] = useState("");

  const usersPerPage = 4;

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchFlags();
    fetchReportedComments();
  }, []);

  useEffect(() => {
    applyTimeFilter();
  }, [entries, timeFilter, specificDate]);

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:8081/analytics");
      setEntries(response.data);
    } catch (error) {
      console.error("Error fetching diary entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`http://localhost:8081/users`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchFlags = async () => {
    try {
      const response = await fetch(`http://localhost:8081/flagged`);
      if (!response.ok) {
        throw new Error("Failed to fetch flags");
      }
      const data = await response.json();
      setFlags(data);
    } catch (error) {
      console.error("Error fetching flags:", error);
    }
  };

  const fetchReportedComments = async () => {
    try {
      const response = await fetch(`http://localhost:8081/getReportedComments`);
      if (!response.ok) {
        throw new Error("Failed to fetch reported comments");
      }
      const data = await response.json();
      setReportedComments(data);
    } catch (error) {
      console.error("Error fetching reported comments:", error);
    }
  };

  const applyTimeFilter = () => {
    const now = new Date();
    const filtered = entries.filter((entry) => {
      const entryDate = new Date(entry.created_at);
      if (specificDate) {
        const selectedDate = new Date(specificDate);
        return (
          entryDate.getFullYear() === selectedDate.getFullYear() &&
          entryDate.getMonth() === selectedDate.getMonth() &&
          entryDate.getDate() === selectedDate.getDate()
        );
      }
      switch (timeFilter) {
        case "Day":
          return now - entryDate <= 1 * 24 * 60 * 60 * 1000;
        case "Week":
          return now - entryDate <= 7 * 24 * 60 * 60 * 1000;
        case "Month":
          return now - entryDate <= 30 * 24 * 60 * 60 * 1000;
        case "Year":
          return now - entryDate <= 365 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    });
    setFilteredEntries(filtered);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.max(
    Math.ceil(filteredUsers.length / usersPerPage),
    1
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleTimeFilterChange = (event) => {
    setTimeFilter(event.target.value);
    setSpecificDate("");
  };

  const handleDateChange = (event) => {
    setSpecificDate(event.target.value);
    setTimeFilter("SpecificDate");
  };

  const groupEntriesByDay = (entries) => {
    const grouped = {};
    entries.forEach((entry) => {
      const entryDate = new Date(entry.created_at);
      const dateString = entryDate.toISOString().split("T")[0]; // Format as "YYYY-MM-DD"
      if (!grouped[dateString]) {
        grouped[dateString] = 0;
      }
      grouped[dateString]++;
    });
    return grouped;
  };

  const groupedEntries = groupEntriesByDay(filteredEntries);

  const chartData = {
    labels: Object.keys(groupedEntries), // Dates as labels
    datasets: [
      {
        label: "Entries per Day",
        data: Object.values(groupedEntries), // Entry counts for each day
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    indexAxis: "x", // Makes the chart horizontal
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw}`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        title: {
          display: true,
          text: "Date",
        },
      },
    },
  };

  return (
    <MainLayout ActiveTab="Dashboard">
      <div className="row mt-2 mt-lg-3 pt-2 px-2">
        <div
          className="col container rounded mt-4 mt-lg-0 p-4 shadow-sm mb-5"
          style={{
            width: "",
            minHeight: "65vh",
            backgroundColor: "#ffff",
          }}
        >
          <h2 className="border-bottom border-2 pb-2">Dashboard</h2>
          <div>
            <div className="row">
              <div className="col-md-6 mb-2">
                <div className="form-floating">
                  <select
                    className="form-select"
                    id="floatingSelectGrid"
                    value={timeFilter}
                    onChange={handleTimeFilterChange}
                  >
                    <option value="Day">Day</option>
                    <option value="Week">Week</option>
                    <option value="Month">Month</option>
                    <option value="Year">Year</option>
                  </select>
                  <label className="z-0" htmlFor="floatingSelectGrid">
                    Viewing Data By
                  </label>
                </div>
              </div>
              <div className="col-md-6 mb-2">
                <label htmlFor="specificDate" className="form-label">
                  Select Specific Date:
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="specificDate"
                  value={specificDate}
                  onChange={handleDateChange}
                />
              </div>
            </div>

            <div className="row gy-2 px-1">
              <div className="col-lg-3 d-flex flex-column gap-2">
                <div className="row gap-2 px-2">
                  <div
                    className="col-sm col-lg-12 border rounded shadow-sm overflow-hidden px-0"
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
                      <p className="m-0">Diary Entries</p>
                    </div>
                    <div
                      className="d-flex align-items-center justify-content-center gap-2"
                      style={{ height: "5rem" }}
                    >
                      <h2 className="m-0">{filteredEntries.length}</h2>
                    </div>
                  </div>
                  <div
                    className="col border rounded shadow-sm overflow-hidden px-0"
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
                      <p className="m-0">Users</p>
                    </div>
                    <div
                      className="d-flex align-items-center justify-content-center gap-2"
                      style={{ height: "5rem" }}
                    >
                      <h2 className="m-0">{users.length}</h2>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md ">
                <div
                  className="overflow-y-scroll custom-scrollbar pe-1 mb-2"
                  style={{ height: "18rem" }}
                >
                  <table className="table rounded">
                    <thead>
                      <tr>
                        <th scope="col">Author</th>
                        <th scope="col">Diary Title</th>
                        <th scope="col">Subject</th>
                        <th scope="col">Engagements</th>
                        <th scope="col">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEntries.length > 0 ? (
                        filteredEntries.map((entry, index) => (
                          <tr key={`${entry.userID}-${index}`}>
                            <td>
                              {entry.firstName} {entry.lastName}
                            </td>
                            <td>{entry.title}</td>
                            <td>{entry.subjects}</td>
                            <td>0</td>
                            <td>
                              <Link to={`/DiaryEntry/${entry.entryID}`}>
                                <button className="primaryButton">View</button>
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">
                            No Diary Entries Available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="d-flex justify-content-center">
                  <Pagination>
                    {totalPages > 1 &&
                      Array.from({ length: totalPages }, (_, index) => (
                        <Pagination.Item
                          key={index + 1}
                          active={index + 1 === currentPage}
                          onClick={() => handlePageChange(index + 1)}
                        >
                          {index + 1}
                        </Pagination.Item>
                      ))}
                  </Pagination>
                </div>
              </div>
            </div>
            <div className="row gap-2 m-auto">
              <div
                className="col-md border rounded shadow-sm overflow-hidden p-0"
                style={{
                  height: "7rem",
                  background: "linear-gradient(to right, #ff4d4d, #ff3333)",
                }}
              >
                <div
                  className="text-light d-flex flex-column justify-content-center align-items-center gap-1"
                  style={{
                    height: "100%",
                  }}
                >
                  <h2 className="m-0">{flags.length}</h2>

                  <p className="m-0">Flagged Diaries</p>
                </div>
              </div>
              <div
                className="col-md border rounded shadow-sm overflow-hidden p-0"
                style={{
                  height: "7rem",
                  background: "linear-gradient(to right, #ff4d4d, #ff3333)",
                }}
              >
                <div
                  className="text-light d-flex flex-column justify-content-center align-items-center gap-1"
                  style={{
                    height: "100%",
                  }}
                >
                  <h2 className="m-0">{reportedComments.length}</h2>

                  <p className="m-0">Reported Comments</p>
                </div>
              </div>
              <div
                className="col-md border rounded shadow-sm overflow-hidden p-0"
                style={{
                  height: "7rem",
                  background: "linear-gradient(to right, #ff4d4d, #ff3333)",
                }}
              >
                <div
                  className="text-light d-flex flex-column justify-content-center align-items-center gap-1"
                  style={{
                    height: "100%",
                  }}
                >
                  <h2 className="m-0">00</h2>

                  <p className="m-0">Reported Users</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-4">
          <h3>Diary Entries Graph</h3>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
