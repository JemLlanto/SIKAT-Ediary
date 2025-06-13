import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Pagination from "react-bootstrap/Pagination";
import axios from "axios";
import Swal from "sweetalert2";

const ReportingComments = () => {
  const [reportComments, setReportComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newReportComments, setNewReportComments] = useState("");
  const [editingReportComments, setEditingReportComments] = useState(null);
  const [editedReportComments, setEditedReportComments] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState();
  const [isDeleting, setIsDeleting] = useState();

  const fetchReportComments = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/reportComments`
      );
      setReportComments(response.data);
      setFilteredComments(response.data);
    } catch (error) {
      console.error("Error fetching Comment reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportComments();
  }, []);

  const handleAddReportComments = async (e) => {
    e.preventDefault();

    if (newReportComments.trim()) {
      try {
        setIsAdding(true);
        // Send to backend and get the response (e.g. with _id or modified data)
        const res = await axios.post(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/commentAPI/reportComments`,
          {
            reason: newReportComments,
          }
        );
        if (res.status === 201) {
          // Update local state
          fetchReportComments();
          setNewReportComments("");
          // Show success alert
          Swal.fire({
            icon: "success",
            title: "Option Added",
            text: `"${newReportComments}" was added successfully.`,
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

  const handleEditReportComments = (reportCommentID, currentReportComments) => {
    setEditingReportComments(reportCommentID);
    setEditedReportComments(currentReportComments);
  };

  const handleSaveEdit = async (reportCommentID) => {
    if (editedReportComments.trim()) {
      try {
        setIsEditing(reportCommentID);
        await axios.put(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/commentAPI/reportCommentEdit/${reportCommentID}`,
          { reason: editedReportComments }
        );

        setEditingReportComments(null);
        fetchReportComments();

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

  const handleDeleteReportComment = async (reportCommentID) => {
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
        setIsDeleting(reportCommentID);
        await axios.delete(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/commentAPI/reportCommentDelete/${reportCommentID}`
        );

        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Option deleted successfully.",
        });
        setIsDeleting();
        fetchReportComments();
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
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = reportComments.filter((comment) =>
      comment.reason.toLowerCase().includes(term)
    );
    setFilteredComments(filtered);
    setCurrentPage(1); // Reset to the first page when searching
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredComments.length / itemsPerPage);
  const currentItems = filteredComments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-3 rounded shadow-sm" style={{ backgroundColor: "#ffff" }}>
      <div className=" position-relative border-bottom d-flex justify-content-center align-items-center pb-2 gap-1">
        <h4 className="border-2 m-0">Report Comments</h4>
        <div className="informationToolTip">
          <h5 className="m-0 d-flex align-items-center justify-content-center">
            <i className="bx bx-info-circle"></i>
          </h5>
          <p className="infToolTip rounded p-2 m-0">
            Reporting comments allows users to alert admins about hurtful or
            disturbing comments, helping to protect victims and address
            inappropriate behavior from the reported user.
          </p>
        </div>
      </div>
      {/* Search Filter */}
      <div className="my-3">
        <InputGroup className="mb-3">
          <InputGroup.Text id="basic-addon1">
            <i className="bx bx-search"></i>
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search by reason..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </InputGroup>
      </div>
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
                        reporting comment options.
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
                        <p className="m-0">No Reporting Comment Options</p>
                      </td>
                    </tr>
                  </>
                ) : (
                  <>
                    {currentItems.map((comment) => (
                      <tr key={comment.reportCommentID}>
                        <td>
                          {editingReportComments === comment.reportCommentID ? (
                            <Form.Control
                              className="bg-transparent text-center border-0 border-bottom border-2"
                              type="text"
                              value={editedReportComments}
                              onChange={(e) =>
                                setEditedReportComments(e.target.value)
                              }
                            />
                          ) : (
                            <p className="m-0 mt-2">{comment.reason}</p>
                          )}
                        </td>
                        <td className="d-flex justify-content-center gap-1">
                          {editingReportComments === comment.reportCommentID ? (
                            <>
                              <Button
                                className="px-3"
                                variant="primary"
                                disabled={
                                  isEditing ||
                                  comment.reportCommentID ===
                                    editedReportComments
                                }
                                onClick={() =>
                                  handleSaveEdit(comment.reportCommentID)
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
                                onClick={() => setEditingReportComments(null)}
                              >
                                <p className="m-0">Cancel</p>
                              </Button>
                            </>
                          ) : (
                            <>
                              <button
                                className="primaryButton"
                                onClick={() =>
                                  handleEditReportComments(
                                    comment.reportCommentID,
                                    comment.reason
                                  )
                                }
                              >
                                <p className="m-0">Edit</p>
                              </button>
                              <Button
                                variant="danger"
                                onClick={() =>
                                  handleDeleteReportComment(
                                    comment.reportCommentID
                                  )
                                }
                                disabled={
                                  isDeleting === comment.reportCommentID
                                }
                              >
                                <p className="m-0">
                                  {isDeleting === comment.reportCommentID ? (
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
      {/* Pagination */}
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
      {/* Add New Comment */}
      <form onSubmit={handleAddReportComments}>
        <h5 className="mt-4">Add Comment Violation</h5>

        <FloatingLabel
          className="mt-3"
          controlId="floatingInputGrid"
          label="New Comment Violation"
        >
          <Form.Control
            type="text"
            placeholder="New Comment Violation"
            value={newReportComments}
            onChange={(e) => setNewReportComments(e.target.value)}
          />
        </FloatingLabel>
        <div className="mt-2 d-flex justify-content-end">
          <button
            type="submit"
            className="w-100 primaryButton px-5 py-2"
            disabled={isAdding || newReportComments === ""}
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
      </form>
    </div>
  );
};

export default ReportingComments;
