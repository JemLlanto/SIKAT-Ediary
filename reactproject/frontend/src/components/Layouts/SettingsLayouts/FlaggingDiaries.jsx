import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import axios from "axios";
import Pagination from "react-bootstrap/Pagination";
import MessageAlert from "../DiaryEntry/messageAlert";
import MessageModal from "../DiaryEntry/messageModal";

const FlaggingDiaries = () => {
  const [flaggingOptions, setFlaggingOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newOption, setNewOption] = useState("");
  const [editingOption, setEditingOption] = useState(null);
  const [editedReason, setEditedReason] = useState("");

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
    const fetchOptions = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/flaggingOptions"
        );
        setFlaggingOptions(response.data);
        setFilteredOptions(response.data);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };
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
        await axios.post("http://localhost:8081/flaggingOptions", {
          option: newOption,
        });
        const newFlag = { reason: newOption, flagID: Date.now(), count: 0 };
        setFlaggingOptions([...flaggingOptions, newFlag]);
        setFilteredOptions([...flaggingOptions, newFlag]);
        setNewOption("");
        setModal({
          show: true,
          message: `Flaggin option added successfully.`,
        });
      } catch (error) {
        console.error("Error adding option:", error);
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
        await axios.put(`http://localhost:8081/flaggingEdit/${flagID}`, {
          reason: editedReason,
        });
        const updatedOptions = flaggingOptions.map((option) =>
          option.flagID === flagID
            ? { ...option, reason: editedReason }
            : option
        );
        setFlaggingOptions(updatedOptions);
        setFilteredOptions(updatedOptions);
        setEditingOption(null);
        setModal({
          show: true,
          message: `Edited successfully.`,
        });
      } catch (error) {
        console.error("Error editing option:", error);
      }
    }
  };

  const handleDeleteOption = (flagID) => {
    setConfirmModal({
      show: true,
      message: `Are you sure you want to delete this option?`,
      onConfirm: async () => {
        axios
          .delete(`http://localhost:8081/flaggingDelete/${flagID}`)
          .then(() => {
            const updatedOptions = flaggingOptions.filter(
              (option) => option.flagID !== flagID
            );
            setFlaggingOptions(updatedOptions);
            setFilteredOptions(updatedOptions);
            closeConfirmModal();
            setModal({
              show: true,
              message: `Flagging option deleted successfully.`,
            });
          })
          .catch((error) => {
            console.error("Error deleting option:", error);
          });
      },
      onCancel: () => setConfirmModal({ show: false, message: "" }),
    });
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
        <h4 className="border-2 m-0">Flagging Diaries</h4>
        <div className="informationToolTip">
          <h5 className="m-0 d-flex align-items-center justify-content-center">
            <i class="bx bx-info-circle"></i>
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
            <i class="bx bx-search"></i>
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
                            onClick={() => handleSaveEdit(option.flagID)}
                          >
                            <p className="m-0">Save</p>
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
                            onClick={() => handleDeleteOption(option.flagID)}
                          >
                            <p className="m-0">Remove</p>
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
          <button type="submit" className="w-100 primaryButton px-5 py-2">
            <p className="m-0">Save</p>
          </button>
        </div>
      </form>
    </div>
  );
};

export default FlaggingDiaries;
