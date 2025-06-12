import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import Pagination from "react-bootstrap/Pagination";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import axios from "axios";
import Swal from "sweetalert2";

const FilterAndSubjects = () => {
  const [filters, setFilters] = useState([]);
  const [filteredFilters, setFilteredFilters] = useState([]);
  const [newFilter, setNewFilter] = useState("");
  const [editingFilter, setEditingFilter] = useState(null);
  const [editedFilter, setEditedFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState();
  const [isDeleting, setIsDeleting] = useState();

  const fetchFilters = async () => {
    try {
      setIsLoading(false);
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/filters`
      );
      setFilters(response.data);
      setFilteredFilters(response.data);
    } catch (error) {
      console.error("Error fetching filters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  const handleAddFilter = async (e) => {
    e.preventDefault();

    if (newFilter.trim()) {
      try {
        setIsAdding(true);
        const newFilterObj = { subject: newFilter, count: 0 };

        // Send to backend and get the response (e.g. with _id or modified data)
        const res = await axios.post(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/settings/filters`,
          newFilterObj
        );
        if (res.status === 201) {
          // Update local state
          fetchFilters();
          setNewFilter("");
          // Show success alert
          Swal.fire({
            icon: "success",
            title: "Subject Added",
            text: `"${newFilter}" was added successfully.`,
          });
        }
      } catch (error) {
        console.error("Error adding filter:", error);

        const errorMessage =
          error.response?.data?.message || "An unexpected error occurred";

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

  const handleEditFilter = (subjectID, currentSubject) => {
    setEditingFilter(subjectID);
    setEditedFilter(currentSubject);
  };

  const handleSaveEdit = async (subjectID) => {
    if (editedFilter.trim()) {
      try {
        setIsEditing(subjectID);
        await axios.put(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/settings/filterEdit/${subjectID}`,
          {
            subject: editedFilter,
          }
        );

        setEditingFilter(null);
        fetchFilters();

        // Success alert using SweetAlert
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Edited successfully.",
        });
      } catch (error) {
        console.error("Error editing filter:", error);

        const errorMessage =
          error.response?.data?.message || "An unexpected error occurred";

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

  const handleDeleteFilter = async (subjectID) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this subject?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setIsDeleting(subjectID);
        await axios.delete(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/settings/filterDelete/${subjectID}`
        );

        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Subject deleted successfully.",
        });
        setIsDeleting();
        fetchFilters();
      } catch (error) {
        console.error("Error deleting filter:", error);

        const errorMessage =
          error.response?.data?.message || "An unexpected error occurred";

        Swal.fire({
          icon: "error",
          title: "Failed to Delete",
          text: errorMessage,
        });
      }
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = filters.filter((filter) =>
      filter.subject.toLowerCase().includes(query)
    );
    setFilteredFilters(filtered);
    setCurrentPage(1); // Reset to the first page
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredFilters.length / itemsPerPage);
  const currentItems = filteredFilters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div
      className="p-3 rounded shadow-sm"
      style={{
        backgroundColor: "#ffff",
        minHeight: "clamp(20rem, 80vh, 30rem)",
      }}
    >
      <div className=" position-relative border-bottom d-flex justify-content-center align-items-center pb-2 gap-1">
        <h4 className="border-2 m-0">Filter and Subjects</h4>
        <div className="informationToolTip">
          <h5 className="m-0 d-flex align-items-center justify-content-center">
            <i className="bx bx-info-circle"></i>
          </h5>
          <p className="infToolTip rounded p-2 m-0">
            Filters and subjects help organize diary entries, making them easy
            to navigate and allowing users to avoid potentially sensitive or
            triggering topics.
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
            placeholder="Search Filters..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </InputGroup>
      </div>
      <div
        className="overflow-y-scroll custom-scrollbar"
        style={{ height: "30vh" }}
      >
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th className="w-50">
                <h5 className="m-0">Filter</h5>
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
                        <i className="bx bx-loader bx-spin"></i>Loading filters
                        and subjects.
                      </span>
                    </h5>
                  </td>
                </tr>
              </>
            ) : (
              <>
                {currentItems.map((filter) => (
                  <tr key={filter.subjectID}>
                    <td className="">
                      {editingFilter === filter.subjectID ? (
                        <Form.Control
                          className="bg-transparent text-center border-0 border-bottom border-2"
                          type="text"
                          value={editedFilter}
                          onChange={(e) => setEditedFilter(e.target.value)}
                        />
                      ) : (
                        <p className="m-0 mt-2">{filter.subject}</p>
                      )}
                    </td>
                    <td className="d-flex justify-content-center gap-1">
                      {editingFilter === filter.subjectID ? (
                        <>
                          <Button
                            className="px-3"
                            variant="primary"
                            disabled={
                              isEditing || filter.subject === editedFilter
                            }
                            onClick={() => handleSaveEdit(filter.subjectID)}
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
                            onClick={() => setEditingFilter(null)}
                          >
                            <p className="m-0">Cancel</p>
                          </Button>
                        </>
                      ) : (
                        <>
                          <button
                            className="primaryButton"
                            onClick={() =>
                              handleEditFilter(filter.subjectID, filter.subject)
                            }
                          >
                            <p className="m-0">Edit</p>
                          </button>
                          <Button
                            variant="danger"
                            onClick={() => handleDeleteFilter(filter.subjectID)}
                            disabled={isDeleting === filter.subjectID}
                          >
                            <p className="m-0">
                              {isDeleting === filter.subjectID ? (
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
      <Form onSubmit={handleAddFilter} className="mt-4">
        <h5>Add New Filter</h5>
        <FloatingLabel
          className="mt-3"
          controlId="newFilter"
          label="New Filter"
        >
          <Form.Control
            type="text"
            placeholder="Enter new filter"
            value={newFilter}
            onChange={(e) => setNewFilter(e.target.value)}
          />
        </FloatingLabel>
        <div className="mt-2 d-flex justify-content-end">
          <button
            type="submit"
            className="w-100 primaryButton px-5 py-2"
            disabled
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

export default FilterAndSubjects;
