import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import axios from "axios";
import Pagination from "react-bootstrap/Pagination";
import Swal from "sweetalert2";

const FlaggingDiaries = () => {
  const [flaggingOptions, setFlaggingOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newOption, setNewOption] = useState("");
  const [editingOption, setEditingOption] = useState(null);
  const [editedReason, setEditedReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState();
  const [isDeleting, setIsDeleting] = useState();

  const fetchOptions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/flaggingOptions`
      );
      setFlaggingOptions(response.data);
      setFilteredOptions(response.data);
    } catch (error) {
      console.error("Error fetching options:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = flaggingOptions.filter((option) =>
      option.reason.toLowerCase().includes(term)
    );
    setFilteredOptions(filtered);
    setCurrentPage(1); // Reset to the first page on a new search
  };

  const handleAddOption = async (e) => {
    e.preventDefault();

    if (newOption.trim()) {
      try {
        setIsAdding(true);
        // Send to backend and get the response (e.g. with _id or modified data)
        const res = await axios.post(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/flaggingAPI/flaggingOptions`,
          {
            option: newOption,
          }
        );
        if (res.status === 201) {
          // Update local state
          fetchOptions();
          setNewOption("");
          // Show success alert
          Swal.fire({
            icon: "success",
            title: "Option Added",
            text: `"${newOption}" was added successfully.`,
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

  const handleEditOption = (flagID, currentReason) => {
    setEditingOption(flagID);
    setEditedReason(currentReason);
  };

  const handleSaveEdit = async (flagID) => {
    if (editedReason.trim()) {
      try {
        setIsEditing(flagID);
        await axios.put(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/flaggingAPI/flaggingEdit/${flagID}`,
          {
            reason: editedReason,
          }
        );

        setEditingOption(null);
        fetchOptions();

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

  const handleDeleteOption = async (flagID) => {
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
        setIsDeleting(flagID);
        await axios.delete(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/flaggingAPI/flaggingDelete/${flagID}`
        );

        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Option deleted successfully.",
        });
        setIsDeleting();
        fetchOptions();
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
      }
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredOptions.length / itemsPerPage);
  const currentItems = filteredOptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div
      className="p-3 rounded shadow-sm"
      style={{
        backgroundColor: "#ffff",
        minHeight: "clamp(20rem, 80vh, 30rem)",
      }}
    >
      <div className=" position-relative border-bottom d-flex justify-content-center align-items-center pb-2 gap-1">
        <h4 className="border-2 m-0">Flagging Diaries</h4>
        <div className="informationToolTip">
          <h5 className="m-0 d-flex align-items-center justify-content-center">
            <i className="bx bx-info-circle"></i>
          </h5>
          <p className="infToolTip rounded p-2 m-0">
            Flagging diaries enables users to report potentially alarming or
            disturbing entries to admins, allowing for immidiate action.
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
            placeholder="Search flagging options..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </InputGroup>
      </div>
      <div
        className="overflow-y-scroll custom-scrollbar"
        style={{ height: "30vh" }}
      >
        {/* Table */}
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th className="w-50">
                <h5 className="m-0">Flagging Option</h5>
              </th>
              <th className="">
                <h5 className="m-0 mb-2 mb-md-0">Actions</h5>
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
                        <i className="bx bx-loader bx-spin"></i>Loading flagging
                        options.
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
                        <p className="m-0">No Flagging Options</p>
                      </td>
                    </tr>
                  </>
                ) : (
                  <>
                    {currentItems.map((option) => (
                      <tr key={option.flagID}>
                        <td>
                          {editingOption === option.flagID ? (
                            <Form.Control
                              className="bg-transparent text-center border-0 border-bottom border-2"
                              type="text"
                              value={editedReason}
                              onChange={(e) => setEditedReason(e.target.value)}
                            />
                          ) : (
                            <p className="m-0 mt-2">{option.reason}</p>
                          )}
                        </td>
                        <td className="d-flex justify-content-center gap-1">
                          {editingOption === option.flagID ? (
                            <>
                              <Button
                                className="px-3"
                                variant="primary"
                                disabled={
                                  isEditing || option.reason === editedReason
                                }
                                onClick={() => handleSaveEdit(option.flagID)}
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
                                onClick={() => setEditingOption(null)}
                              >
                                <p className="m-0">Cancel</p>
                              </Button>
                            </>
                          ) : (
                            <>
                              <button
                                className="primaryButton"
                                onClick={() =>
                                  handleEditOption(option.flagID, option.reason)
                                }
                              >
                                <p className="m-0">Edit</p>
                              </button>
                              <Button
                                variant="danger"
                                onClick={() =>
                                  handleDeleteOption(option.flagID)
                                }
                                disabled={isDeleting === option.flagID}
                              >
                                <p className="m-0">
                                  {isDeleting === option.flagID ? (
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
      {/* Add New Option */}
      <form onSubmit={handleAddOption}>
        <h5 className="mt-4">Add Flagging Option</h5>
        <FloatingLabel
          className="mt-3"
          controlId="floatingInputGrid"
          label="New Flagging Option"
        >
          <Form.Control
            type="text"
            placeholder="New Flagging Option"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
          />
        </FloatingLabel>
        <div className="mt-2 d-flex justify-content-end">
          <button
            type="submit"
            className="w-100 primaryButton px-5 py-2"
            disabled={isAdding || newOption === ""}
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

export default FlaggingDiaries;
