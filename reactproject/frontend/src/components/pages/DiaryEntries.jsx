import React, { useState, useEffect } from "react";
import MainLayout from "../Layouts/MainLayout";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";
import LeftSideLayout from "../Layouts/Home/LeftSideLayout";
import { Modal } from "react-bootstrap";

const DiaryEntries = () => {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const ActiveTab = "Entries";
  const [entryModal, setEntryModal] = useState(false);

  const showEntryModal = () => {
    setEntryModal(true);
  };

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
        console.log(response.data);

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
  const [selectedDayEntries, setSelectedDayEntries] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  const handleDayClick = (day) => {
    const entriesForDay = findEntriesForDay(day);
    setSelectedDay(day);
    setSelectedDayEntries(entriesForDay);
    setEntryModal(true);
  };

  const hideEntryModal = () => {
    setSelectedDay(null);
    setEntryModal(false);
    setSelectedDayEntries([]);
  };

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

  const findEntriesForDay = (day) => {
    return entries.filter((entry) => {
      const entryDate = new Date(entry.created_at);
      const localEntryDate = new Date(
        entryDate.getTime() + entryDate.getTimezoneOffset() * 60000
      );

      return (
        localEntryDate.getDate() === day &&
        localEntryDate.getMonth() === months.indexOf(selectedMonth) &&
        localEntryDate.getFullYear() === parseInt(selectedYear, 10)
      );
    });
  };

  if (isLoading) {
    return <Spinner animation="border" role="status" />;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!user) return null;

  return (
    <MainLayout ActiveTab={ActiveTab}>
      <div className="row mt-0 mt-lg-2 pt-2 px-2">
        <div
          className="col-lg-3 d-none d-lg-block"
          style={{ position: "sticky", top: "75px", height: "100%" }}
        >
          <LeftSideLayout></LeftSideLayout>
        </div>
        <div className="col-lg">
          <div className="container-fluid container-md mb-2 mt-4 mt-lg-2 px-0">
            <div className="dateContainer shadow d-flex justify-content-center flex-wrap gap-1">
              <div className="ps-1">
                <h4 className="m-0 text-light fw-bolder">
                  {user.isAdmin
                    ? "Post/Announcements for"
                    : "Diary Entries for"}
                </h4>
              </div>
              <div>
                <select
                  className="dateSelector px-0"
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
                  const entriesForDay = findEntriesForDay(day);
                  return (
                    <div className="col-4 col-md-3 col-xl-2 p-1" key={day}>
                      <div
                        className="days border rounded bg-light shadow-sm p-2"
                        style={{ height: "80px" }}
                      >
                        <div className="d-flex align-items-center gap-1">
                          <p className="m-0 text-start text-secondary">{day}</p>
                        </div>
                        {entriesForDay.length > 0 ? (
                          <>
                            <button
                              className="primaryButton p-0 px-2 px-sm-4 py-2"
                              onClick={() => handleDayClick(day)}
                            >
                              <h6 className="m-0 my-1 mx-2 mx-md-3">
                                {entriesForDay.length}{" "}
                                {user.isAdmin
                                  ? entriesForDay.length > 1
                                    ? "Posts"
                                    : "Post"
                                  : entriesForDay.length > 1
                                  ? "Entries"
                                  : "Entry"}
                              </h6>
                            </button>
                          </>
                        ) : (
                          <p className="m-0 mt-2 mt-md-0 text-secondary fw-normal">
                            {user.isAdmin ? "No Post" : "No Entry"}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal show={entryModal} onHide={hideEntryModal} centered>
        <Modal.Header>
          <Modal.Title>
            <h4 className="m-0">
              {selectedDay &&
                `${
                  user.isAdmin ? "Post" : "Diary Entry"
                } for ${selectedDay} ${selectedMonth} ${selectedYear}`}
            </h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDayEntries.map((entry) => (
            <>
              <div className="d-flex">
                <Link
                  to={`/DiaryEntry/${entry.entryID}`}
                  key={entry.entryID}
                  className="w-100 btn btn-light text-decoration-none"
                  // style={{ zIndex: "10000" }}
                >
                  <p className="m-0 text-start text-secondary  d-flex align-items-center gap-1">
                    {entry.title}
                    <span className=" d-flex align-items-center">
                      {entry.visibility === "private" ? (
                        <i class="bx bx-lock-alt"></i>
                      ) : (
                        <>
                          <i class="bx bx-globe"></i>
                          {entry.anonimity === "private" ? (
                            <>
                              <i class="bx bxs-user position-relative">
                                <i
                                  class="bx bx-question-mark position-absolute"
                                  style={{
                                    left: ".5rem",
                                    fontSize: "clamp(0.6rem, 1.5dvw, 0.7rem)",
                                  }}
                                ></i>
                              </i>
                            </>
                          ) : null}
                        </>
                      )}
                    </span>
                  </p>
                </Link>
              </div>
            </>
          ))}
        </Modal.Body>
      </Modal>
    </MainLayout>
  );
};

export default DiaryEntries;
