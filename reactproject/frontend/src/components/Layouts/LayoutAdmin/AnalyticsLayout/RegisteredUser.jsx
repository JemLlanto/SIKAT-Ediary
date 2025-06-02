import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Pagination from "react-bootstrap/Pagination";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import MessageModal from "../../DiaryEntry/messageModal";
import MessageAlert from "../../DiaryEntry/messageAlert";
import RegisterUserDownloadButton from "../../DownloadButton/RegisterUserDownloadButton";

const RegisteredUsers = ({ users }) => {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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
    let filtered = [...users];

    if (selectedCourse !== "All") {
      filtered = filtered.filter((user) => user.course === selectedCourse);
    }

    if (selectedYear !== "All") {
      filtered = filtered.filter((user) => user.year === selectedYear);
    }

    if (searchQuery.trim() !== "") {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(lowerCaseQuery) ||
          user.lastName.toLowerCase().includes(lowerCaseQuery) ||
          user.course.toLowerCase().includes(lowerCaseQuery) ||
          user.sex.toLowerCase() === lowerCaseQuery ||
          user.year.toLowerCase().includes(lowerCaseQuery) ||
          user.studentNumber.toString().includes(lowerCaseQuery)
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, selectedCourse, selectedYear, searchQuery]);

  // Calculate pagination
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

  return (
    <div className="d-flex flex-column justify-content" style={{ height: "" }}>
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
              placeholder="Search name, course, year"
              aria-label="Search"
              aria-describedby="basic-addon1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
          <table className="table rounded overfh">
            <thead
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "#f8f9fa",
                zIndex: 2,
              }}
            >
              <tr>
                <th scope="col" className="text-center align-middle">
                  <h5 className="m-0">Student No.</h5>
                </th>
                <th scope="col" className="text-center align-middle">
                  <h5 className="m-0 text-center align-middle">Full Name</h5>
                </th>
                <th scope="col" className="text-center align-middle">
                  <h5 className="m-0 text-center align-middle">Sex</h5>
                </th>
                <th
                  scope="col"
                  className="text-center align-middle "
                  style={{ minWidth: "clamp(16rem, 70dvw, 20dvw)" }}
                >
                  <div className="d-flex align-items-center justify-content-center">
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="form-select border-0 fw-bold text-center "
                      style={{ maxWidth: "max-content" }}
                    >
                      <option value="All">Courses(All)</option>
                      <option className="" value="BS Information Technology">
                        BS Information Technology
                      </option>
                      <option value="BS Industrial Technology">
                        BS Industrial Technology
                      </option>
                      <option value="BS Computer Science">
                        BS Computer Science
                      </option>
                      <option value="BS Computer Engineering">
                        BS Computer Engineering
                      </option>
                    </select>
                  </div>
                </th>
                <th
                  scope="col"
                  className="text-center align-middle ps-3 ps-lg-4"
                  style={{ minWidth: "clamp(6.5rem, 50dvw, 10rem)" }}
                >
                  <div className="d-flex align-items-center justify-content-center">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="form-select border-0 fw-bold text-center"
                      style={{
                        maxWidth: "max-content",
                      }}
                    >
                      <option value="All">Year(All)</option>
                      <option value="1st">1st</option>
                      <option value="2nd">2nd</option>
                      <option value="3rd">3rd</option>
                      <option value="4th">4th</option>
                    </select>
                  </div>
                </th>
                <th scope="col" className="text-center align-middle">
                  <h5 className="m-0">CvSU Email</h5>
                </th>
                <th scope="col" className="text-center align-middle">
                  <h5 className="m-0">Profile</h5>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user.userID}>
                    <th scope="row" className="text-center align-middle">
                      <p className="m-0">{user.studentNumber}</p>
                    </th>
                    <td className="text-center align-middle">
                      <p className="m-0">{`${user.firstName} ${user.lastName}`}</p>
                    </td>
                    <td className="text-center align-middle">
                      <p className="m-0">{user.sex}</p>
                    </td>
                    <td className="text-center align-middle">
                      <p className="m-0">{user.course}</p>
                    </td>
                    <td className="text-center align-middle">
                      <p className="m-0">{user.year}</p>
                    </td>
                    <td className="text-center align-middle">
                      <p className="m-0">{user.cvsuEmail}</p>
                    </td>
                    <td className="text-center align-middle">
                      <Link to={`/Profile/${user.userID}`}>
                        <button className="primaryButton">
                          <p className="m-0">Visit</p>
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No registered users available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-between">
          {/* Statistics */}
          <div className="row mt-2 w-50">
            <div className="col-lg-3 d-flex flex-column align-items-start">
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
        <RegisterUserDownloadButton filteredUsers={filteredUsers} />
      </div>
    </div>
  );
};

export default RegisteredUsers;
