import React, { useState, useEffect } from "react";

import { Link } from "react-router-dom";
import Pagination from "react-bootstrap/Pagination";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import axios from "axios";
import MessageModal from "../../DiaryEntry/messageModal";
import MessageAlert from "../../DiaryEntry/messageAlert";
import FlaggedDiariesDownloadButton from "../../DownloadButton/FlaggedDiariesDownloadButton";

const FlaggedDiaries = ({ flags }) => {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [flaggedDiaryReasons, setFlaggedDiaryReasons] = useState([]);
  const [alarmingWords, setAlarmingWords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
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

  useEffect(() => {
    const fetchFlaggedReasons = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/fetchFlaggedDiaryReasons"
        );
        console.log("API Response:", response.data);
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
          "http://localhost:8081/flaggingOptions"
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

  const handleAddressed = (entryID) => {
    setConfirmModal({
      show: true,
      message: `Are you sure you want to address this flagged?`,
      onConfirm: async () => {
        axios
          .put(`http://localhost:8081/flaggedAddress/${entryID}`)
          .then(() => {
            closeConfirmModal();
            setModal({
              show: true,
              message: `Flagged diary has been addressed.`,
            });
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          })
          .catch((err) => {
            setError(err.response?.data?.error || "Failed to update flagged");
          });
      },
      onCancel: () => setConfirmModal({ show: false, message: "" }),
    });
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
              placeholder="Search by name, student number, behaviors, or title"
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
                  <div className="d-flex align-items-center justify-content-center">
                    <select
                      className="form-select border-0 fw-bold text-center"
                      style={{
                        maxWidth: "max-content",
                      }}
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                      <option value="All">Reason(All)</option>
                      {alarmingWords.map((word, index) => (
                        <option
                          key={index}
                          className="text-break"
                          value={word.reason || word.title}
                        >
                          {word.reason || word.title}
                        </option>
                      ))}
                    </select>
                  </div>
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
                    <td className="text-center align-middle">
                      {/* Display actions only for pending reports */}
                      {!flag.isAddress && (
                        <button
                          className="secondaryButton p-2"
                          onClick={() => handleAddressed(flag.entryID)}
                        >
                          <p className="m-0">Mark as Reviewed</p>
                        </button>
                      )}
                      <Link to={`/DiaryEntry/${flag.entryID}`}>
                        <button className="primaryButton">
                          <p className="m-0">Check</p>
                        </button>
                      </Link>
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
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-between">
          {/* Statistics */}
          <div className="row mt-2 w-50">
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
          </div>
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
        <FlaggedDiariesDownloadButton currentUsers={currentUsers} />
      </div>
    </div>
  );
};

export default FlaggedDiaries;
