import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import Pagination from "react-bootstrap/Pagination";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import axios from "axios";
import MessageModal from "../DiaryEntry/messageModal";
import MessageAlert from "../DiaryEntry/messageAlert";

const FilterAndSubjects = () => {
  const [filters, setFilters] = useState([]);
  const [filteredFilters, setFilteredFilters] = useState([]);
  const [newFilter, setNewFilter] = useState("");
  const [editingFilter, setEditingFilter] = useState(null);
  const [editedFilter, setEditedFilter] = useState("");
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
    const fetchFilters = async () => {
      try {
        const response = await axios.get("http://localhost:8081/filters");
        setFilters(response.data);
        setFilteredFilters(response.data);
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };
    fetchFilters();
  }, []);

  const handleAddFilter = async (e) => {
    e.preventDefault();
    if (newFilter.trim()) {
      try {
        const newFilterObj = { subject: newFilter, count: 0 };
        await axios.post("http://localhost:8081/filters", newFilterObj);
        setFilters([...filters, newFilterObj]);
        setFilteredFilters([...filteredFilters, newFilterObj]);
        setNewFilter("");
        setModal({
          show: true,
          message: `Subject added successfully.`,
        });
      } catch (error) {
        console.error("Error adding filter:", error);
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
        await axios.put(`http://localhost:8081/filterEdit/${subjectID}`, {
          subject: editedFilter,
        });
        const updatedFilters = filters.map((filter) =>
          filter.subjectID === subjectID
            ? { ...filter, subject: editedFilter }
            : filter
        );
        setFilters(updatedFilters);
        setFilteredFilters(updatedFilters);
        setEditingFilter(null);
        setModal({
          show: true,
          message: `Edited Successfully.`,
        });
      } catch (error) {
        console.error("Error editing filter:", error);
      }
    }
  };

  const handleDeleteFilter = async (subjectID) => {
    setConfirmModal({
      show: true,
      message: `Are you sure you want to delete this subject?`,
      onConfirm: async () => {
        try {
          await axios.delete(`http://localhost:8081/filterDelete/${subjectID}`);
          const updatedFilters = filters.filter(
            (filter) => filter.subjectID !== subjectID
          );
          setFilters(updatedFilters);
          setFilteredFilters(updatedFilters);
          closeConfirmModal();
          setModal({
            show: true,
            message: `Subject deleted successfully.`,
          });
        } catch (error) {
          console.error("Error deleting filter:", error);
        }
      },
      onCancel: () => setConfirmModal({ show: false, message: "" }),
    });
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
            <i class="bx bx-search"></i>
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
                        onClick={() => handleSaveEdit(filter.subjectID)}
                      >
                        <p className="m-0">Save</p>
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
          <button type="submit" className="w-100 primaryButton px-5 py-2">
            <p className="m-0">Save</p>
          </button>
        </div>
      </Form>
    </div>
  );
};

export default FilterAndSubjects;
