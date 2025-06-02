import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Button from "react-bootstrap/Button";
import Pagination from "react-bootstrap/Pagination";
import axios from "axios";
import MessageAlert from "../DiaryEntry/messageAlert";
import MessageModal from "../DiaryEntry/messageModal";

const ReportingUsers = () => {
  const [reportUsers, setReportUsers] = useState([]);
  const [filteredReportUsers, setFilteredReportUsers] = useState([]);
  const [newReportUsers, setNewReportUsers] = useState("");
  const [editingReportUsers, setEditingReportUsers] = useState(null);
  const [editedReportUsers, setEditedReportUsers] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
    const fetchReportUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8081/reportUsers");
        setReportUsers(response.data);
        setFilteredReportUsers(response.data);
      } catch (error) {
        console.error("Error fetching report users:", error);
      }
    };
    fetchReportUsers();
  }, []);

  const handleAddReportUsers = async (e) => {
    e.preventDefault();
    if (newReportUsers.trim()) {
      try {
        const newUser = { reason: newReportUsers, count: 0 };
        await axios.post("http://localhost:8081/reportUsers", newUser);
        setReportUsers([...reportUsers, newUser]);
        setFilteredReportUsers([...filteredReportUsers, newUser]);
        setNewReportUsers("");
        setModal({
          show: true,
          message: `User violation added successfully.`,
        });
      } catch (error) {
        console.error("Error adding report user:", error);
      }
    }
  };

  const handleEditReportUsers = (reportingUserID, currentReportUsers) => {
    setEditingReportUsers(reportingUserID);
    setEditedReportUsers(currentReportUsers);
  };

  const handleSaveEdit = async (reportingUserID) => {
    if (editedReportUsers.trim()) {
      try {
        await axios.put(
          `http://localhost:8081/reportUsers/${reportingUserID}`,
          { reason: editedReportUsers }
        );
        const updatedUsers = reportUsers.map((user) =>
          user.reportingUserID === reportingUserID
            ? { ...user, reason: editedReportUsers }
            : user
        );
        setReportUsers(updatedUsers);
        setFilteredReportUsers(updatedUsers);
        setEditingReportUsers(null);
        setModal({
          show: true,
          message: `Edited successfully.`,
        });
      } catch (error) {
        console.error("Error editing report user:", error);
      }
    }
  };

  const handleDeleteReportUser = async (reportingUserID) => {
    setConfirmModal({
      show: true,
      message: `Are you sure you want to delete this user violation?`,
      onConfirm: async () => {
        try {
          await axios.delete(
            `http://localhost:8081/reportUsers/${reportingUserID}`
          );
          const updatedUsers = reportUsers.filter(
            (user) => user.reportingUserID !== reportingUserID
          );
          setReportUsers(updatedUsers);
          setFilteredReportUsers(updatedUsers);
          closeConfirmModal();
          setModal({
            show: true,
            message: `User violation deleted successfully.`,
          });
        } catch (error) {
          console.error("Error deleting report user:", error);
        }
      },
      onCancel: () => setConfirmModal({ show: false, message: "" }),
    });
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = reportUsers.filter((user) =>
      user.reason.toLowerCase().includes(query)
    );
    setFilteredReportUsers(filtered);
    setCurrentPage(1); // Reset to first page
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredReportUsers.length / itemsPerPage);
  const currentItems = filteredReportUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-3 rounded shadow-sm" style={{ backgroundColor: "#fff" }}>
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

      <div className="position-relative border-bottom d-flex justify-content-center align-items-center pb-2 gap-1">
        <h4 className="border-2 m-0">Reporting Users</h4>
        <div className="informationToolTip">
          <h5 className="m-0 d-flex align-items-center justify-content-center">
            <i class="bx bx-info-circle"></i>
          </h5>
          <p className="infToolTip rounded p-2 m-0">
            Reporting users allows individuals to notify admins about
            inappropriate or harmful behavior, ensuring a safer and more
            respectful environment for everyone.
          </p>
        </div>
      </div>
      {/* Search Filter */}
      <InputGroup className="my-3">
        <InputGroup.Text id="basic-addon1">
          <i class="bx bx-search"></i>
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder="Search Report Reasons..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </InputGroup>
      {/* Table */}
      <div
        className="overflow-y-scroll custom-scrollbar"
        style={{ height: "30vh" }}
      >
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th className="w-50">
                <h5 className="m-0">Reason</h5>
              </th>

              <th>
                <h5 className="m-0">Actions</h5>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((user) => (
              <tr key={user.reportingUserID}>
                <td>
                  {editingReportUsers === user.reportingUserID ? (
                    <Form.Control
                      className="bg-transparent text-center border-0 border-bottom border-2"
                      type="text"
                      value={editedReportUsers}
                      onChange={(e) => setEditedReportUsers(e.target.value)}
                    />
                  ) : (
                    <p className="m-0 mt-2">{user.reason}</p>
                  )}
                </td>
                <td className="d-flex justify-content-center gap-1">
                  {editingReportUsers === user.reportingUserID ? (
                    <>
                      <Button
                        className="px-3"
                        variant="success"
                        onClick={() => handleSaveEdit(user.reportingUserID)}
                      >
                        <p className="m-0">Save</p>
                      </Button>
                      <Button
                        className="px-3"
                        variant="secondary"
                        onClick={() => setEditingReportUsers(null)}
                      >
                        <p className="m-0">Cancel</p>
                      </Button>
                    </>
                  ) : (
                    <>
                      <button
                        className="primaryButton"
                        onClick={() =>
                          handleEditReportUsers(
                            user.reportingUserID,
                            user.reason
                          )
                        }
                      >
                        <p className="m-0">Edit</p>
                      </button>
                      <Button
                        variant="danger"
                        onClick={() =>
                          handleDeleteReportUser(user.reportingUserID)
                        }
                      >
                        <p className="m-0">Remove</p>
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <Pagination className="mt-3 justify-content-center">
        {[...Array(totalPages).keys()].map((page) => (
          <Pagination.Item
            key={page + 1}
            active={page + 1 === currentPage}
            onClick={() => handlePageChange(page + 1)}
          >
            <p className="m-0">{page + 1}</p>
          </Pagination.Item>
        ))}
      </Pagination>
      <Form onSubmit={handleAddReportUsers}>
        <h5 className="mt-4">Add User Violation</h5>

        <div className="mt-3">
          <FloatingLabel controlId="newReportReason" label="Add User Violation">
            <Form.Control
              type="text"
              placeholder="Enter new report reason"
              value={newReportUsers}
              onChange={(e) => setNewReportUsers(e.target.value)}
            />
          </FloatingLabel>
        </div>
        <h5></h5>

        <div className="mt-2 d-flex justify-content-end">
          <button type="submit" className="w-100 primaryButton px-5 py-2">
            <p className="m-0">Save</p>
          </button>
        </div>
      </Form>
    </div>
  );
};

export default ReportingUsers;
