import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import Pagination from "react-bootstrap/Pagination";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import axios from "axios";
import Swal from "sweetalert2";

const FAQ = () => {
  const [faqs, setFaqs] = useState([]); // Rename filters to faqs
  const [filteredFaqs, setFilteredFaqs] = useState([]); // Rename filteredFilters to filteredFaqs
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [editingFaq, setEditingFaq] = useState(null); // Rename editingFilter to editingFaq
  const [editedQuestion, setEditedQuestion] = useState("");
  const [editedAnswer, setEditedAnswer] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState();
  const [isDeleting, setIsDeleting] = useState();

  const fetchFaqs = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/FAQAPI/faqs`
      ); // Rename filters endpoint to faqs
      setFaqs(response.data);
      setFilteredFaqs(response.data); // Rename setFilteredFilters to setFilteredFaqs
    } catch (error) {
      console.error("Error fetching faqs:", error); // Rename filters to faqs
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleAddFaq = async (e) => {
    e.preventDefault();

    const newFaqObj = {
      // Rename filterObj to faqObj
      question: newQuestion,
      answer: newAnswer,
      count: 0,
    };

    if (newFaqObj) {
      try {
        setIsAdding(true);
        // Send to backend and get the response (e.g. with _id or modified data)
        const res = await axios.post(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/FAQAPI/faqs`,
          newFaqObj
        );
        if (res.status === 201) {
          // Update local state
          fetchFaqs();
          setNewAnswer("");
          setNewQuestion("");
          // Show success alert
          Swal.fire({
            icon: "success",
            title: "FAQ Added",
            text: `FAQ was added successfully.`,
          });
        }
      } catch (error) {
        console.error("Error adding FAQ:", error);

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

  const handleEditFaq = (faqID, currentQuestion, currentAnswer) => {
    // Rename handleEditFilter to handleEditFaq
    setEditingFaq(faqID); // Rename editingFilter to editingFaq
    setEditedQuestion(currentQuestion);
    setEditedAnswer(currentAnswer);
  };

  const handleSaveEdit = async (faqID) => {
    if (editedQuestion.trim()) {
      try {
        setIsEditing(faqID);
        await axios.put(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/FAQAPI/faqedit/${faqID}`,
          {
            question: editedQuestion,
            answer: editedAnswer,
          }
        );

        setEditingFaq(null);
        fetchFaqs();
        // Success alert using SweetAlert
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Edited successfully.",
        });
      } catch (error) {
        console.error("Error editing FAQ:", error);

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

  const handleDeleteFaq = async (faqID) => {
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
        setIsDeleting(faqID);
        await axios.delete(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/FAQAPI/faq/${faqID}`
        );

        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "FAQ deleted successfully.",
        });
        setIsDeleting();
        fetchFaqs();
      } catch (error) {
        console.error("Error deleting option FAQ:", error);

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
    const filtered = faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
    );
    setFilteredFaqs(filtered);
    setCurrentPage(1);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredFaqs.length / itemsPerPage);
  const currentItems = filteredFaqs.slice(
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
        <h4 className="border-2 m-0">Frequently Asked Questions (FAQs)</h4>
        <div className="informationToolTip">
          <h5 className="m-0 d-flex align-items-center justify-content-center">
            <i className="bx bx-info-circle"></i>
          </h5>
          <p className="infToolTip rounded p-2 m-0">
            Frequently Asked Questions (FAQs) provide users with quick answers
            to common inquiries, helping them navigate the platform and resolve
            issues efficiently.
          </p>
        </div>
      </div>
      {/* Search FAQ */} {/* Rename searchFilters to searchFaq */}
      <div className="my-3">
        <InputGroup className="mb-3">
          <InputGroup.Text id="basic-addon1">
            <i className="bx bx-search"></i>
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search FAQs..." // Change Filters to FAQs
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
              <th className="w-25">
                <h5 className="m-0">Question</h5>
              </th>
              <th className="w-50">
                <h5 className="m-0">Answer</h5>
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
                        <i className="bx bx-loader bx-spin"></i>Loading FAQs.
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
                      <td colSpan={3}>
                        <p className="m-0">No FAQs found.</p>
                      </td>
                    </tr>
                  </>
                ) : (
                  <>
                    {currentItems.map(
                      (
                        faq // Rename filter to faq
                      ) => (
                        <tr key={faq.faqID}>
                          <td className="">
                            {editingFaq === faq.faqID ? ( // Rename editingFilter to editingFaq
                              <Form.Control
                                className="bg-transparent text-center border-0 border-bottom border-2"
                                type="text"
                                value={editedQuestion}
                                onChange={(e) =>
                                  setEditedQuestion(e.target.value)
                                }
                              />
                            ) : (
                              <p className="m-0 mt-2">{faq.question}</p> // Rename filter to faq
                            )}
                          </td>
                          <td className="">
                            {editingFaq === faq.faqID ? ( // Rename editingFilter to editingFaq
                              <Form.Control
                                className="bg-transparent text-center border-0 border-bottom border-2"
                                type="text"
                                value={editedAnswer}
                                onChange={(e) =>
                                  setEditedAnswer(e.target.value)
                                }
                              />
                            ) : (
                              <p className="m-0 mt-2">{faq.answer}</p> // Rename filter to faq
                            )}
                          </td>
                          <td className="align-middle">
                            <div className="d-flex justify-content-center gap-1">
                              {editingFaq === faq.faqID ? (
                                <>
                                  <Button
                                    className="px-3"
                                    variant="primary"
                                    disabled={
                                      isEditing ||
                                      (faq.question === editedQuestion &&
                                        faq.answer === editedAnswer)
                                    }
                                    onClick={() => handleSaveEdit(faq.faqID)}
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
                                    onClick={() => setEditingFaq(null)}
                                  >
                                    <p className="m-0">Cancel</p>
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="px-3 primaryButton"
                                    onClick={() =>
                                      handleEditFaq(
                                        faq.faqID,
                                        faq.question,
                                        faq.answer
                                      )
                                    }
                                  >
                                    <p className="m-0">Edit</p>
                                  </button>
                                  <Button
                                    variant="danger"
                                    onClick={() => handleDeleteFaq(faq.faqID)}
                                    disabled={isDeleting === faq.faqID}
                                  >
                                    <p className="m-0">
                                      {isDeleting === faq.faqID ? (
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
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </>
                )}
              </>
            )}
          </tbody>
        </Table>
      </div>
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
      <div className="d-flex flex-column gap-2 mt-4">
        <h5>Add New FAQ</h5>

        <div className="row gap-1">
          <div className="">
            <FloatingLabel
              controlId="floatingInput"
              label="Question"
              className=""
            >
              <Form.Control
                type="text"
                placeholder="Enter question"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
            </FloatingLabel>
          </div>
          <div>
            <FloatingLabel
              controlId="floatingPassword"
              label="Answer"
              className=""
            >
              <Form.Control
                as="textarea"
                placeholder="Answer to the question"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
              />
            </FloatingLabel>
          </div>
        </div>

        <div className="d-flex justify-content-end">
          <button
            type="submit"
            className="w-100 primaryButton px-5 py-2"
            disabled={isAdding || newQuestion === "" || newAnswer === ""}
            onClick={handleAddFaq}
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
    </div>
  );
};

export default FAQ;
