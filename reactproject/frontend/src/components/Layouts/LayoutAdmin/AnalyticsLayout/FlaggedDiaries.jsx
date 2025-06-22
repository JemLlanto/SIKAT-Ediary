import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import Pagination from "react-bootstrap/Pagination";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import axios from "axios";
import MessageModal from "../../DiaryEntry/messageModal";
import MessageAlert from "../../DiaryEntry/messageAlert";
import FlaggedDiariesDownloadButton from "../../DownloadButton/FlaggedDiariesDownloadButton";

const FlaggedDiaries = ({ user }) => {
  const [flags, setFlags] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [flaggedDiaryReasons, setFlaggedDiaryReasons] = useState([]);
  const [alarmingWords, setAlarmingWords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const usersPerPage = 10;

  const [modal, setModal] = useState({ show: false, message: "" });
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
  });

  const closeModal = () => {
    setModal({ show: false, message: "" });
  };
  const closeConfirmModal = () => {
    setConfirmModal({
      show: false,
      message: "",
      onConfirm: () => {},
      onCancel: () => {},
    });
  };

  // FETCHING REPORTED USERS
  const fetchFlaggedDiaries = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/flagged`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch flagged diaries: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Fetching data for user role:", user.isAdmin);

      let filteredData = data;

      if (user.isAdmin === 2) {
        filteredData = data.filter(
          (userItem) => userItem.departmentID === user.departmentID
        );
      }
      console.log("Fetched flagged diaries:", filteredData);

      setFlags(filteredData);
    } catch (error) {
      console.error("Error fetching flagged diaries:", error);
      // Optionally: show an error toast or message to user
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchFlaggedDiaries();
  }, [user]);

  useEffect(() => {
    const fetchFlaggedReasons = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/fetchFlaggedDiaryReasons`
        );
        // console.log("API Response:", response.data);
        setFlaggedDiaryReasons(response.data);
      } catch (error) {
        console.error("Error fetching alarming words:", error);
      }
    };

    fetchFlaggedReasons();
  }, []);

  useEffect(() => {
    const fetchAlarmingWords = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/flaggingOptions`
        );
        setAlarmingWords(response.data);
      } catch (error) {
        console.error("Error fetching alarming words:", error);
      }
    };

    fetchAlarmingWords();
  }, []);

  useEffect(() => {
    const applyFilter = () => {
      let filtered = [...flags];

      // Apply subject filter
      if (selectedSubject !== "All") {
        filtered = filtered.filter((flag) =>
          flag.reason.toLowerCase().includes(selectedSubject.toLowerCase())
        );
      }

      if (searchTerm) {
        filtered = filtered.filter((flag) => {
          const isAddressed = flag.isAddress === 1 ? "Addressed" : "Pending";
          return `${flag.firstName} ${flag.lastName} ${flag.studentNumber} ${flag.reasons} ${flag.title} ${isAddressed}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        });
      }

      // Grouping the flagged diaries by title and reasons and counting occurrences
      const groupedFlags = filtered.reduce((acc, flag) => {
        const key = `${flag.title}_${flag.reasons}`; // Use both title and reasons as key
        if (!acc[key]) {
          // Initialize the group
          acc[key] = { ...flag, count: 1 };
        } else {
          // Increment the count for the same report
          acc[key].count += 1;
        }
        return acc;
      }, {});

      // Convert the grouped object into an array
      const mergedFlags = Object.values(groupedFlags);

      setFilteredUsers(mergedFlags);
      setCurrentPage(1);
    };

    applyFilter();
  }, [flags, selectedSubject, searchTerm]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Handlers
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handlePrevClick = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleAddressed = async (entryID) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to mark this flagged diary as reviewed?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, mark as reviewed!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        Swal.showLoading();

        await axios.put(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/flaggedAddress/${entryID}`
        );

        await Swal.fire({
          icon: "success",
          title: "Reviewed!",
          text: "Flagged diary has been addressed.",
          timer: 1500,
          showConfirmButton: false,
        });

        fetchFlaggedDiaries();
      } catch (err) {
        console.error("Error updating flagged diary:", err);
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text:
            err.response?.data?.error ||
            "Failed to update flagged diary. Please try again.",
        });
      }
    }
  };

  const getFlaggedReasonsText = (flaggedDiaryReasons, flag) => {
    if (!flaggedDiaryReasons || flaggedDiaryReasons.length === 0) {
      return "No reason available";
    }

    const reasonCounts = flaggedDiaryReasons
      .filter((flaggedReason) => flaggedReason.entryID === flag.entryID)
      .reduce((count, flaggedReason) => {
        count[flaggedReason.reason] = (count[flaggedReason.reason] || 0) + 1;
        return count;
      }, {});

    return Object.entries(reasonCounts)
      .map(([reason, count]) => `${reason} x${count}`)
      .join(", ");
  };

  return (
    <div className="d-flex flex-column">
      <MessageAlert
        showModal={modal}
        closeModal={closeModal}
        title={"Notice"}
        message={modal.message}
      ></MessageAlert>
      <MessageModal
        showModal={confirmModal}
        closeModal={closeConfirmModal}
        title={"Confirmation"}
        message={confirmModal.message}
        confirm={confirmModal.onConfirm}
        needConfirm={1}
      ></MessageModal>

      <div>
        <div>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1">
              <i className="bx bx-search"></i>
            </InputGroup.Text>
            <Form.Control
              placeholder="Search: author or diary title"
              aria-label="Search"
              aria-describedby="basic-addon1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>
        {/* Users Table */}
        <div
          className="custom-scrollbar"
          style={{
            height: "40vh",
            overflowY: "auto",
          }}
        >
          <table className="table rounded">
            <thead
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "#f8f9fa",
                zIndex: 2,
              }}
            >
              <tr>
                {/* <th scope="col" className="text-center align-middle">
                  <h5 className="m-0">Student No.</h5>
                </th> */}
                <th scope="col" className="text-center align-middle">
                  <h5 className="m-0">Author</h5>
                </th>
                <th
                  scope="col"
                  className="text-center align-middle"
                  style={{ minWidth: "10rem", maxWidth: "10rem" }}
                >
                  <h5 className="m-0">Reason/s</h5>
                </th>
                <th scope="col" className="text-center align-middle">
                  <h5 className="m-0">Diary Title</h5>
                </th>
                <th scope="col" className="text-center align-middle">
                  <h5 className="m-0">Count</h5>
                </th>
                <th scope="col" className="text-center align-middle">
                  <h5 className="m-0">Status</h5>
                </th>
                <th
                  scope="col"
                  className="text-center align-middle"
                  style={{ minWidth: "clamp(13rem, 20dvw, 15rem)" }}
                >
                  <h5 className="m-0">Action</h5>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <>
                  <tr>
                    <td
                      colSpan={7}
                      scope="row"
                      className="text-center align-middle"
                    >
                      <p className="m-0 text-secondary ">
                        <span className="d-flex align-items-center justify-content-center gap-1">
                          <i className="bx bx-loader bx-spin"></i>Loading
                          flagged diaries.
                        </span>
                      </p>
                    </td>
                  </tr>
                </>
              ) : (
                <>
                  {currentUsers.length > 0 ? (
                    currentUsers.map((flag, index) => (
                      <tr key={index}>
                        {/* <th scope="row" className="text-center align-middle">
                      <p className="m-0">{flag.studentNumber}</p>
                    </th> */}
                        <td className="text-center align-middle">
                          <p className="m-0">{`${flag.firstName} ${flag.lastName}`}</p>
                        </td>
                        <td className="text-center align-middle">
                          <p className="m-0">
                            {flaggedDiaryReasons &&
                            flaggedDiaryReasons.length > 0 ? (
                              Object.entries(
                                flaggedDiaryReasons
                                  .filter(
                                    (flaggedReason) =>
                                      flaggedReason.entryID === flag.entryID
                                  )
                                  .reduce((count, flaggedReason) => {
                                    count[flaggedReason.reason] =
                                      (count[flaggedReason.reason] || 0) + 1;
                                    return count;
                                  }, {})
                              ).map(([reason, count]) => (
                                <div key={reason}>
                                  <p className="m-0">
                                    {reason} x{count}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="m-0">No reason available</p>
                            )}
                          </p>
                        </td>
                        <td className="text-center align-middle">
                          <p className="m-0">{flag.title}</p>
                        </td>

                        <td className="text-center align-middle">
                          <p className="m-0">{flag.flagCount}</p>
                        </td>
                        <td className="text-center align-middle">
                          {flag.isAddress === 1 ? (
                            <p className="text-success m-0">Addressed</p>
                          ) : (
                            <p className="text-danger m-0">Pending</p>
                          )}
                        </td>
                        <td
                          className="text-center align-middle"
                          style={{ width: "5rem" }}
                        >
                          <div className=" d-flex flex-column gap-1">
                            {/* Display actions only for pending reports */}
                            {!flag.isAddress && (
                              <button
                                className="w-100 orangeButton py-2"
                                onClick={() => handleAddressed(flag.entryID)}
                              >
                                <p className="m-0">Mark as Reviewed</p>
                              </button>
                            )}
                            <Link to={`/DiaryEntry/${flag.entryID}`}>
                              <button className="w-100 primaryButton py-2">
                                <p className="m-0">Check</p>
                              </button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No flagged diaries available.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-center">
          {/* Statistics */}
          {/* <div className="row mt-2 w-50">
            <div className="col-lg-2 d-flex flex-column align-items-start">
              <h5 className="m-0">Total: {filteredUsers.length}</h5>
              <p className="m-0 text-secondary">
                Female:{" "}
                {filteredUsers.filter((user) => user.sex === "Female").length}
              </p>
              <p className="m-0 text-secondary">
                Male:{" "}
                {filteredUsers.filter((user) => user.sex === "Male").length}
              </p>
            </div>
          </div> */}
          {/* Pagination */}
          <Pagination className="d-flex justify-content-center align-items-center mt-4">
            <Pagination.First onClick={() => handlePageChange(1)} />
            <Pagination.Prev
              onClick={handlePrevClick}
              disabled={currentPage === 1}
            />
            {[...Array(totalPages)].map((_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === currentPage}
                onClick={() => handlePageChange(index + 1)}
              >
                <p className="m-0">{index + 1}</p>
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={handleNextClick}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last onClick={() => handlePageChange(totalPages)} />
          </Pagination>
        </div>
      </div>
      {/* Download Button */}
      <div className="row d-flex gap-1 mt-2 px-3">
        <FlaggedDiariesDownloadButton
          currentUsers={currentUsers}
          flaggedDiaryReasons={flaggedDiaryReasons}
        />
      </div>
    </div>
  );
};

export default FlaggedDiaries;
