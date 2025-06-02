import React, { useState, useEffect } from "react";
import UserPageMainLayout from "../../Layouts/LayoutUser/UserPageMainLayout";
import publicIcon from "../../../assets/public.png";
import privateIcon from "../../../assets/private.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner"; // Use a spinner if needed
import MainLayout from "../../Layouts/MainLayout";

const DiaryEntries = () => {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (userData) {
      const fetchUser = JSON.parse(userData);

      fetch(`http://localhost:8081/fetchUser/user/${fetchUser.userID}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("User not found");
          }
          return response.json();
        })
        .then((data) => {
          setUser(data);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setIsLoading(false);
        });
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8081/fetchUserEntry/user/${user.userID}`
      );
      if (response.data.entries && Array.isArray(response.data.entries)) {
        setEntries(response.data.entries);
      } else {
        console.error("Response data is not an array", response.data);
        setEntries([]);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
      setError("No entry found.");
    } finally {
      setIsLoading(false);
    }
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth();

  const years = Array.from(
    { length: currentYear - 2024 + 1 },
    (_, i) => 2024 + i
  );

  const [selectedMonth, setSelectedMonth] = useState(months[currentMonthIndex]);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [daysInMonth, setDaysInMonth] = useState([]);

  const getDaysInMonth = (month, year) => {
    const monthIndex = months.indexOf(month);
    return new Date(year, monthIndex + 1, 0).getDate();
  };

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      const days = getDaysInMonth(selectedMonth, selectedYear);
      setDaysInMonth(Array.from({ length: days }, (_, i) => i + 1));
    } else {
      setDaysInMonth([]);
    }
  }, [selectedMonth, selectedYear]);

  const findEntryForDay = (day) => {
    return entries.find((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getDate() === day &&
        entryDate.getMonth() === months.indexOf(selectedMonth) &&
        entryDate.getFullYear() === selectedYear
      );
    });
  };

  if (isLoading) {
    return <Spinner animation="border" role="status" />; // Add a spinner
  }

  if (error) {
    return <p>Error: {error}</p>; // Show error if something went wrong
  }

  if (!user) return null;

  return (
    <MainLayout>
      <div>
        <div className="container-fluid container-md mb-2 mt-5">
          <div className="dateContainer shadow">
            <div>
              <select
                className="dateSelector"
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {months.map((month, index) => (
                  <option className="dateOption" key={index} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                className="dateSelector"
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map((year, index) => (
                  <option className="dateOption" key={index} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="container-fluid container-md">
          {daysInMonth.length > 0 && (
            <div className="row">
              {daysInMonth.map((day) => {
                const entry = findEntryForDay(day);
                return (
                  <div className="col-4 col-md-3 col-lg-2 py-1" key={day}>
                    <Link
                      to={entry ? `/DiaryEntry/${entry.entryID}` : "#"}
                      className="text-decoration-none"
                    >
                      <div
                        className="days border rounded bg-light shadow-sm p-2"
                        style={{ height: "80px" }}
                      >
                        <div className="d-flex align-items-center gap-1">
                          <p className="m-0 text-start text-secondary">{day}</p>
                          {entry && (
                            <>
                              <img
                                src={
                                  entry.privacy === "public"
                                    ? publicIcon
                                    : privateIcon
                                }
                                alt={entry.privacy}
                                style={{ width: "15px", height: "15px" }}
                              />
                            </>
                          )}
                        </div>
                        <h5 className="m-0 text-secondary">
                          {entry ? entry.title : "No Entry"}
                        </h5>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default DiaryEntries;
