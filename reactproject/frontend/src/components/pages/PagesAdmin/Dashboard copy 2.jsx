import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "react-bootstrap/Pagination";
import MainLayout from "../../Layouts/MainLayout";
import axios from "axios";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { filter } from "lodash";
import MessageModal from "../../Layouts/DiaryEntry/messageModal";
import Reports from "../../Layouts/LayoutAdmin/Dashboard/Reports";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
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
  const [genderBasedIncidents, setGenderBasedIncidents] = useState([]);
  const [reportedUsers, setReportedUsers] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [filteredFlags, setFilteredFlags] = useState([]);
  const [filteredReportedComments, setFilteredReportedComments] = useState([]);
  const [filteredGenderBasedIncidents, setFilteredGenderBasedIncidents] =
    useState([]);
  const [filteredReportedUsers, setFilteredReportedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState("Week");
  const [specificDate, setSpecificDate] = useState("");
  const [weeklyEntries, setWeeklyEntries] = useState({});
  const [weeklyFlags, setWeeklyFlags] = useState({});
  const [weeklyReportedComments, setWeeklyReportedComments] = useState({});
  const [weeklyGenderBased, setWeeklyGenderBased] = useState({});
  const [weeklyReportedUsers, setWeeklyReportedUsers] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const usersPerPage = 4;

  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [modal, setModal] = useState({ show: false, message: "" });
  const closeModal = () => {
    setModal({ show: false, message: "" });
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      if (parsedUser.isAdmin !== 1) {
        setModal({
          show: true,
          message: `Permission Denied: You are not authorized to access this page.`,
        });
        setTimeout(() => {
          parsedUser.isAdmin === 2
            ? navigate("/Admin/Home")
            : navigate("/Home");
        }, 1500);
      }
    } else {
      navigate("/");
    }

    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    fetchEntries();
    fetchUsers();
    fetchFlags();
    fetchReportedComments();
    fetchGenderBasedIncidents();
    fetchReportedUsers();
  }, []);

  useEffect(() => {
    applyTimeFilter();
  }, [
    entries,
    flags,
    reportedComments,
    genderBasedIncidents,
    reportedUsers,
    timeFilter,
    specificDate,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    setWeeklyEntries(calculateWeeklyData(filteredEntries));
    setWeeklyFlags(calculateWeeklyData(filteredFlags));
    setWeeklyReportedComments(calculateWeeklyData(filteredReportedComments));
    setWeeklyGenderBased(calculateWeeklyData(filteredGenderBasedIncidents));
    setWeeklyReportedUsers(calculateWeeklyData(filteredReportedUsers));
  }, [
    filteredEntries,
    filteredFlags,
    filteredReportedComments,
    filteredGenderBasedIncidents,
    filteredReportedUsers,
  ]);

  const calculateWeeklyData = (data) => {
    const weeklyData = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };
    data.forEach((item) => {
      const day = new Date(item.created_at).getDay();
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      weeklyData[days[day]]++;
    });
    return weeklyData;
  };

  const graphData = {
    labels: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    datasets: [
      {
        label: "Diary Entries",
        data: Object.values(calculateWeeklyData(filteredEntries)),
        backgroundColor: "#DA498D",
      },
      {
        label: "Flagged Diaries",
        data: Object.values(calculateWeeklyData(filteredFlags)),
        backgroundColor: "#F14A00",
      },
      {
        label: "Reported Comments",
        data: Object.values(calculateWeeklyData(filteredReportedComments)),
        backgroundColor: "#e65c00",
      },
      {
        label: "Gender Based Incidents",
        data: Object.values(calculateWeeklyData(filteredGenderBasedIncidents)),
        backgroundColor: "#5c0099",
      },
      {
        label: "Reported Users",
        data: Object.values(calculateWeeklyData(filteredReportedUsers)),
        backgroundColor: "#A31D1D",
      },
    ],
  };

  const graphOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Data this week (Mon-Sun)",
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

  const doughnutData = {
    labels: ["Total Entries", "Total Users"],
    datasets: [
      {
        data: [filteredEntries.length, users.length],
        backgroundColor: ["#5c0099", "#0099cc"],
        borderColor: ["#5c0099", "#0099cc"],
        borderWidth: 1,
      },
    ],
  };

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
      const response = await axios.get("http://localhost:8081/users");
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchFlags = async () => {
    try {
      const response = await axios.get("http://localhost:8081/flagged");
      setFlags(response.data);
    } catch (error) {
      console.error("Error fetching flags:", error);
    }
  };

  const fetchReportedComments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8081/getReportedComments"
      );
      setReportedComments(response.data);
    } catch (error) {
      console.error("Error fetching reported comments:", error);
    }
  };

  const fetchGenderBasedIncidents = async () => {
    try {
      const response = await axios.get("http://localhost:8081/reports");
      setGenderBasedIncidents(response.data);
    } catch (error) {
      console.error("Error fetching reported incidents:", error);
    }
  };

  const fetchReportedUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8081/getReportedUsers"
      );
      setReportedUsers(response.data);
    } catch (error) {
      console.error("Error fetching reported users:", error);
    }
  };

  const applyTimeFilter = () => {
    const now = new Date();
    const filterData = (data) => {
      return data.filter((item) => {
        const date = new Date(item.created_at);

        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          return date >= start && date <= end;
        }

        // If only specificDate or timeFilter is defined
        if (specificDate) {
          const selectedDate = new Date(specificDate);
          return (
            date.getFullYear() === selectedDate.getFullYear() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getDate() === selectedDate.getDate()
          );
        }
        switch (timeFilter) {
          case "Day":
            return now - date <= 1 * 24 * 60 * 60 * 1000;
          case "Week":
            return now - date <= 7 * 24 * 60 * 60 * 1000;
          case "Month":
            return now - date <= 30 * 24 * 60 * 60 * 1000;
          case "Year":
            return now - date <= 365 * 24 * 60 * 60 * 1000;
          default:
            return true;
        }
      });
    };

    setFilteredEntries(filterData(entries));
    setFilteredFlags(filterData(flags));
    setFilteredReportedComments(filterData(reportedComments));
    setFilteredGenderBasedIncidents(filterData(genderBasedIncidents));
    setFilteredReportedUsers(filterData(reportedUsers));
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredEntries.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.max(
    Math.ceil(filteredEntries.length / usersPerPage),
    1
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleTimeFilterChange = (event) => {
    setTimeFilter(event.target.value);
    setSpecificDate("");
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
    setTimeFilter("CustomRange"); // Optional, for clarity
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
    setTimeFilter("CustomRange"); // Optional, for clarity
  };

  const AnalyticsFlaggedDiaries = "FlaggedDiaries";
  const AnalyticsReportedComments = "ReportedComments";
  const AnalyticsReportedUsers = "ReportedUsers";

  return (
    <MainLayout ActiveTab="Dashboard">
      <MessageModal
        showModal={modal}
        closeModal={closeModal}
        title={"Notice"}
        message={modal.message}
      ></MessageModal>{" "}
      <div className="mt-2 mt-lg-3 pt-2 px-2">
        <div
          className="container rounded mt-4 mt-lg-0 p-4 shadow-sm mb-5"
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
                <div className="row gap-1 m-auto">
                  <div className="col-md form-floating p-0">
                    <input
                      type="date"
                      className="form-control"
                      id="startDate"
                      placeholder="Start Date"
                      value={startDate}
                      onChange={handleStartDateChange}
                    />
                    <label className="ms-2" htmlFor="startDate">
                      Start Date:
                    </label>
                  </div>
                  <div className="col-md form-floating p-0">
                    <input
                      type="date"
                      className="form-control"
                      id="endDate"
                      placeholder="End Date"
                      value={endDate}
                      onChange={handleEndDateChange}
                    />
                    <label className="ms-2" htmlFor="endDate">
                      End Date:
                    </label>
                  </div>
                </div>
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
                        currentUsers.map((entry, index) => (
                          <tr key={`${entry.userID}-${index}`}>
                            <td>
                              {entry.firstName} {entry.lastName}
                            </td>
                            <td>{entry.title}</td>
                            <td>{entry.subjects ? entry.subjects : "N/A"}</td>
                            <td>{entry.engagementCount}</td>
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
                    <Pagination.First
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    />

                    {Array.from({ length: totalPages }, (_, i) => (
                      <Pagination.Item
                        key={i + 1}
                        active={i + 1 === currentPage}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </Pagination.Item>
                    ))}

                    <Pagination.Next
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              </div>
            </div>

            <Reports
              filteredGenderBasedIncidents={filteredGenderBasedIncidents}
              filteredFlags={filteredFlags}
              filteredReportedComments={filteredReportedComments}
              filteredReportedUsers={filteredReportedUsers}
            />
          </div>
        </div>
      </div>
      <div className="row row-cols-1 row-cols-lg-2 justify-content-center">
        <div className="col">
          <Bar data={graphData} options={graphOptions} />
        </div>
        <div className="col-lg-3">
          <Doughnut data={doughnutData} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
