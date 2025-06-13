import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Button from "react-bootstrap/Button";
import Pagination from "react-bootstrap/Pagination";
import axios from "axios";
import Swal from "sweetalert2";

const ReportingUsers = () => {
  const [reportUsers, setReportUsers] = useState([]);
  const [filteredReportUsers, setFilteredReportUsers] = useState([]);
  const [newReportUsers, setNewReportUsers] = useState("");
  const [editingReportUsers, setEditingReportUsers] = useState(null);
  const [editedReportUsers, setEditedReportUsers] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState();
  const [isDeleting, setIsDeleting] = useState();

  const fetchReportUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/reportingUserAPI/reportUsers`
      );
      // console.log(response.data);
      setReportUsers(response.data);
      setFilteredReportUsers(response.data);
    } catch (error) {
      console.error("Error fetching report users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportUsers();
  }, []);

  const handleAddReportUsers = async (e) => {
    e.preventDefault();

    if (newReportUsers.trim()) {
      try {
        setIsAdding(true);
        // Send to backend and get the response (e.g. with _id or modified data)
        const res = await axios.post(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/reportingUserAPI/reportUsers`,
          {
            reason: newReportUsers,
          }
        );
        if (res.status === 201) {
          // Update local state
          fetchReportUsers();
          setNewReportUsers("");
          // Show success alert
          Swal.fire({
            icon: "success",
            title: "Option Added",
            text: `"${newReportUsers}" was added successfully.`,
          });
        }
      } catch (error) {
        console.error("Error adding Option:", error);

        const errorMessage =
          error.response?.data?.message ||
          "An unexpected error occurred" + ", Please try again later.";

        Swal.fire({
          icon: "error",
          title: "Failed to Add",
          text: errorMessage,
        });
      } finally {
        setIsAdding(false);
      }
    }
  };

  const handleEditReportUsers = (reportedUserID, currentReportUsers) => {
    setEditingReportUsers(reportedUserID);
    setEditedReportUsers(currentReportUsers);
  };
  const handleSaveEdit = async (reportedUserID) => {
    if (editedReportUsers.trim()) {
      try {
        setIsEditing(reportedUserID);
        await axios.put(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/reportingUserAPI/reportUsers/${reportedUserID}`,
          { reason: editedReportUsers }
        );

        setEditingReportUsers(null);
        fetchReportUsers;
        // Success alert using SweetAlert
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Edited successfully.",
        });
      } catch (error) {
        console.error("Error editing option:", error);

        const errorMessage =
          error.response?.data?.message ||
          "An unexpected error occurred" + ", Please try again later.";

        Swal.fire({
          icon: "error",
          title: "Failed to Edit",
          text: errorMessage,
        });
      } finally {
        setIsEditing();
      }
    }
  };

  const handleDeleteReportUser = async (reportedUserID) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setIsDeleting(reportedUserID);
        await axios.delete(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/reportingUserAPI/reportUsers/${reportedUserID}`
        );

        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Option deleted successfully.",
        });
        setIsDeleting();
        fetchReportUsers();
      } catch (error) {
        console.error("Error deleting option:", error);

        const errorMessage =
          error.response?.data?.message ||
          "An unexpected error occurred" + ", Please try again later.";

        Swal.fire({
          icon: "error",
          title: "Failed to Delete",
          text: errorMessage,
        });
      } finally {
        setIsDeleting();
      }
    }
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
      <div className="position-relative border-bottom d-flex justify-content-center align-items-center pb-2 gap-1">
        <h4 className="border-2 m-0">Reporting Users</h4>
        <div className="informationToolTip">
          <h5 className="m-0 d-flex align-items-center justify-content-center">
            <i className="bx bx-info-circle"></i>
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
          <i className="bx bx-search"></i>
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
            {isLoading ? (
              <>
                <tr>
                  <td
                    colSpan={7}
                    scope="row"
                    className="text-center align-middle"
                  >
                    <h5 className="m-0 text-secondary ">
                      <span className="d-flex align-items-center justify-content-center gap-1">
                        <i className="bx bx-loader bx-spin"></i>Loading
                        reporting user options.
                      </span>
                    </h5>
                  </td>
                </tr>
              </>
            ) : (
              <>
                {currentItems.length === 0 ? (
                  <>
                    <tr className="align-middle">
                      <td colSpan={2}>
                        <p className="m-0">No Reporting User Options</p>
                      </td>
                    </tr>
                  </>
                ) : (
                  <>
                    {currentItems.map((user) => (
                      <tr key={user.reportedUserID}>
                        <td>
                          {editingReportUsers === user.reportedUserID ? (
                            <Form.Control
                              className="bg-transparent text-center border-0 border-bottom border-2"
                              type="text"
                              value={editedReportUsers}
                              onChange={(e) =>
                                setEditedReportUsers(e.target.value)
                              }
                            />
                          ) : (
                            <p className="m-0 mt-2">{user.reason}</p>
                          )}
                        </td>
                        <td className="d-flex justify-content-center gap-1">
                          {editingReportUsers === user.reportedUserID ? (
                            <>
                              <Button
                                className="px-3"
                                variant="primary"
                                disabled={
                                  isEditing || user.reason === editedReportUsers
                                }
                                onClick={() =>
                                  handleSaveEdit(user.reportedUserID)
                                }
                              >
                                <p className="m-0">
                                  {isEditing ? (
                                    <>
                                      <span className="d-flex align-items-center justify-content-center gap-1">
                                        <i className="bx bx-loader bx-spin"></i>
                                        Saving
                                      </span>
                                    </>
                                  ) : (
                                    <>Save</>
                                  )}
                                </p>
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
                                    user.reportedUserID,
                                    user.reason
                                  )
                                }
                              >
                                <p className="m-0">Edit</p>
                              </button>
                              <Button
                                variant="danger"
                                onClick={() =>
                                  handleDeleteReportUser(user.reportedUserID)
                                }
                                disabled={isDeleting === user.reportedUserID}
                              >
                                <p className="m-0">
                                  {isDeleting === user.reportedUserID ? (
                                    <>
                                      <span className="d-flex align-items-center justify-content-center gap-1">
                                        <i className="bx bx-loader bx-spin"></i>
                                        Removing
                                      </span>
                                    </>
                                  ) : (
                                    <>Remove</>
                                  )}
                                </p>
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </>
            )}
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
          <button
            type="submit"
            className="w-100 primaryButton px-5 py-2"
            disabled={isAdding || newReportUsers === ""}
          >
            <p className="m-0">
              {isAdding ? (
                <>
                  <span className="d-flex align-items-center justify-content-center gap-1">
                    <i className="bx bx-loader bx-spin"></i>
                    Saving
                  </span>
                </>
              ) : (
                <>Save</>
              )}
            </p>
          </button>
        </div>
      </Form>
    </div>
  );
};

export default ReportingUsers;
