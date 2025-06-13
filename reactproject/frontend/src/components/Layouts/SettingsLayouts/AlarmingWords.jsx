import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import Pagination from "react-bootstrap/Pagination";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import axios from "axios";
import Swal from "sweetalert2";

const AlarmingWords = () => {
  const [alarmingWords, setAlarmingWords] = useState([]);
  const [filteredAlarmingWords, setFilteredAlarmingWords] = useState([]);
  const [newAlarmingWord, setNewAlarmingWord] = useState("");
  const [editingWordID, setEditingWordID] = useState(null);
  const [editedAlarmingWord, setEditedAlarmingWord] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState();
  const [isDeleting, setIsDeleting] = useState();

  const fetchAlarmingWords = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/alarmingWordsAPI/alarmingWords`
      );
      setAlarmingWords(response.data);
      setFilteredAlarmingWords(response.data);
    } catch (error) {
      console.error("Error fetching alarming words:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlarmingWords();
  }, []);

  const handleAddAlarmingWord = async (e) => {
    e.preventDefault();

    if (newAlarmingWord.trim()) {
      try {
        setIsAdding(true);
        // Send to backend and get the response (e.g. with _id or modified data)
        const res = await axios.post(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/alarmingWordsAPI/alarmingWords`,
          { alarmingWord: newAlarmingWord.trim() }
        );
        if (res.status === 201) {
          // Update local state
          fetchAlarmingWords();
          setNewAlarmingWord("");
          // Show success alert
          Swal.fire({
            icon: "success",
            title: "Alarming word Added",
            text: `"${newAlarmingWord}" was added successfully.`,
          });
        }
      } catch (error) {
        console.error("Error adding Alarming word:", error);

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

  const handleEditAlarmingWord = (wordID, currentWord) => {
    setEditingWordID(wordID);
    setEditedAlarmingWord(currentWord);
  };

  const handleSaveEdit = async (wordID) => {
    if (editedAlarmingWord.trim()) {
      try {
        setIsEditing(wordID);
        await axios.put(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/alarmingWordsAPI/alarmingWordEdit/${wordID}`,
          {
            alarmingWord: editedAlarmingWord,
          }
        );

        setEditingWordID(null);
        fetchAlarmingWords();
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

  const handleDeleteAlarmingWord = async (wordID) => {
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
        setIsDeleting(wordID);
        await axios.delete(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/alarmingWordsAPI/alarmingWordDelete/${wordID}`
        );

        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Alarming word deleted successfully.",
        });
        setIsDeleting();
        fetchAlarmingWords();
      } catch (error) {
        console.error("Error deleting option Alarming word:", error);

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
    const filtered = alarmingWords.filter((word) =>
      word.alarmingWord.toLowerCase().includes(query)
    );
    setFilteredAlarmingWords(filtered);
    setCurrentPage(1);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredAlarmingWords.length / itemsPerPage);
  const currentItems = filteredAlarmingWords.slice(
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
      <div className="position-relative border-bottom d-flex justify-content-center align-items-center pb-2 gap-1">
        <h4 className="border-2 m-0">Alarming Words</h4>
        <div className="informationToolTip">
          <h5 className="m-0 d-flex align-items-center justify-content-center">
            <i className="bx bx-info-circle"></i>
          </h5>
          <p className="infToolTip rounded p-2 m-0">
            Alarming words are predefined terms used to automatically detect
            potentially concerning diary entries and alert admins for prompt
            action.
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
            placeholder="Search Alarming Words..."
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
                <h5 className="m-0">Word</h5>
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
                        <i className="bx bx-loader bx-spin"></i>Loading alarming
                        words.
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
                        <p className="m-0">No alarming words found.</p>
                      </td>
                    </tr>
                  </>
                ) : (
                  <>
                    {currentItems.map((word) => (
                      <tr key={word.wordID}>
                        <td className="">
                          {editingWordID === word.wordID ? (
                            <Form.Control
                              className="bg-transparent text-center border-0 border-bottom border-2"
                              type="text"
                              value={editedAlarmingWord}
                              onChange={(e) =>
                                setEditedAlarmingWord(e.target.value)
                              }
                            />
                          ) : (
                            <p className="m-0 mt-2">{word.alarmingWord}</p>
                          )}
                        </td>
                        <td>
                          {editingWordID === word.wordID ? (
                            <div className="d-flex justify-content-center gap-1 ">
                              <Button
                                className="px-3"
                                variant="primary"
                                disabled={
                                  isEditing ||
                                  word.alarmingWord === editedAlarmingWord
                                }
                                onClick={() => handleSaveEdit(word.wordID)}
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
                                onClick={() => setEditingWordID(null)}
                              >
                                <p className="m-0">Cancel</p>
                              </Button>
                            </div>
                          ) : (
                            <div className="d-flex justify-content-center gap-1">
                              <button
                                className="primaryButton"
                                onClick={() =>
                                  handleEditAlarmingWord(
                                    word.wordID,
                                    word.alarmingWord
                                  )
                                }
                              >
                                <p className="m-0">Edit</p>
                              </button>
                              <Button
                                variant="danger"
                                onClick={() =>
                                  handleDeleteAlarmingWord(word.wordID)
                                }
                                disabled={isDeleting === word.wordID}
                              >
                                <p className="m-0">
                                  {isDeleting === word.wordID ? (
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
                            </div>
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
      <div className="mt-3">
        <Pagination className="justify-content-center">
          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item
              key={index + 1}
              active={index + 1 === currentPage}
              onClick={() => handlePageChange(index + 1)}
            >
              <p className="m-0">{index + 1}</p>{" "}
            </Pagination.Item>
          ))}
        </Pagination>
      </div>
      {/* Add New Alarming Word */}
      <div className="d-flex flex-column gap-2 mt-4">
        <h5>Add New Alarming Word</h5>

        <FloatingLabel
          controlId="floatingInput"
          label="Add New Alarming Word"
          className=""
        >
          <Form.Control
            type="text"
            placeholder="Enter alarming word"
            value={newAlarmingWord}
            onChange={(e) => setNewAlarmingWord(e.target.value)}
          />
        </FloatingLabel>
        <button
          type="submit"
          className="w-100 primaryButton px-5 py-2"
          disabled={isAdding || newAlarmingWord === ""}
          onClick={handleAddAlarmingWord}
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
    </div>
  );
};

export default AlarmingWords;
