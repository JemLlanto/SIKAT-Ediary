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
import UserDiaryEntryReports from "../../Layouts/LayoutAdmin/Dashboard/UserDiaryEntryReports";

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
        label: " New diary entries",
        data: Object.values(calculateWeeklyData(filteredEntries)),
        backgroundColor: "#5c0099",
      },
      {
        label: "New Users",
        data: Object.values(calculateWeeklyData(filteredUsers)),
        backgroundColor: "#ffb31a",
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
        "http://localhost:8081/analyticsReportedComments"
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
        "http://localhost:8081/analyticsReportedUsers"
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
    setFilteredUsers(filterData(users));
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
    setStartDate("");
    setEndDate("");
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
    setTimeFilter("");
    setSpecificDate("");
    setTimeFilter("CustomRange"); // Optional, for clarity
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
    setTimeFilter("");
    setSpecificDate("");
    setTimeFilter("CustomRange"); // Optional, for clarity
  };

  return (
    <MainLayout ActiveTab="Dashboard">
      <MessageModal
        showModal={modal}
        closeModal={closeModal}
        title={"Notice"}
        message={modal.message}
      ></MessageModal>{" "}
      <div className="px-2 mt-4 mt-sm-2">
        <div
          className="container rounded p-4 mt-3 shadow-sm "
          style={{
            width: "",
            minHeight: "55vh",
            backgroundColor: "#ffff",
          }}
        >
          <h2 className="border-bottom border-2 pb-2">Dashboard</h2>
          <div>
            <div className="row gap-1 m-auto">
              <div className="col-md mb-2 px-0">
                <div className="form-floating">
                  <select
                    className="form-select"
                    id="floatingSelectGrid"
                    value={timeFilter}
                    onChange={handleTimeFilterChange}
                  >
                    <option value="">Choices...</option>
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
              <div className="col-md mb-2 px-0">
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

            <UserDiaryEntryReports
              graphData={graphData}
              filteredEntries={filteredEntries}
              filteredUsers={filteredUsers}
            />
            <Reports
              filteredGenderBasedIncidents={filteredGenderBasedIncidents}
              filteredFlags={filteredFlags}
              filteredReportedComments={filteredReportedComments}
              filteredReportedUsers={filteredReportedUsers}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
