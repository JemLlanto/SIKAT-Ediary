import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import Pagination from "react-bootstrap/Pagination";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import axios from "axios";
import MessageAlert from "../DiaryEntry/messageAlert";
import MessageModal from "../DiaryEntry/messageModal";

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
    const fetchFaqs = async () => {
      try {
        const response = await axios.get("http://localhost:8081/faqs"); // Rename filters endpoint to faqs
        setFaqs(response.data);
        setFilteredFaqs(response.data); // Rename setFilteredFilters to setFilteredFaqs
      } catch (error) {
        console.error("Error fetching faqs:", error); // Rename filters to faqs
      }
    };
    fetchFaqs();
  }, []);

  const handleAddFaq = async (e) => {
    e.preventDefault();
    if (newQuestion.trim() && newAnswer.trim()) {
      try {
        const newFaqObj = {
          // Rename filterObj to faqObj
          question: newQuestion,
          answer: newAnswer,
          count: 0,
        };
        await axios.post("http://localhost:8081/faqs", newFaqObj); // Change endpoint to /faqs
        setFaqs([...faqs, newFaqObj]); // Rename filters to faqs
        setFilteredFaqs([...filteredFaqs, newFaqObj]); // Rename filteredFilters to filteredFaqs
        setNewQuestion("");
        setNewAnswer("");
        setModal({
          show: true,
          message: `FAQ added successfully.`,
        });
      } catch (error) {
        console.error("Error adding faq:", error); // Rename filter to faq
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
    if (editedQuestion.trim() && editedAnswer.trim()) {
      try {
        await axios.put(`http://localhost:8081/faqedit/${faqID}`, {
          question: editedQuestion,
          answer: editedAnswer,
        });
        const updatedFaqs = faqs.map((faq) =>
          faq.faqID === faqID
            ? { ...faq, question: editedQuestion, answer: editedAnswer }
            : faq
        );
        setFaqs(updatedFaqs);
        setFilteredFaqs(updatedFaqs);
        setEditingFaq(null);
        setModal({
          show: true,
          message: `Edited successfully.`,
        });
      } catch (error) {
        console.error("Error editing faq:", error);
      }
    }
  };

  const handleDeleteFaq = async (faqID) => {
    setConfirmModal({
      show: true,
      message: `Are you sure you want to delete this FAQ?`,
      onConfirm: async () => {
        try {
          await axios.delete(`http://localhost:8081/faq/${faqID}`);
          const updatedFaqs = faqs.filter((faq) => faq.faqID !== faqID);
          setFaqs(updatedFaqs);
          setFilteredFaqs(updatedFaqs);
          closeConfirmModal();
          setModal({
            show: true,
            message: `Successfully deleted.`,
          });
        } catch (error) {
          console.error("Error deleting faq:", error);
        }
      },
      onCancel: () => setConfirmModal({ show: false, message: "" }),
    });
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
                        onChange={(e) => setEditedQuestion(e.target.value)}
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
                        onChange={(e) => setEditedAnswer(e.target.value)}
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
                            onClick={() => handleSaveEdit(faq.faqID)}
                          >
                            <p className="m-0">Save</p>
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
                              handleEditFaq(faq.faqID, faq.question, faq.answer)
                            }
                          >
                            <p className="m-0">Edit</p>
                          </button>
                          <Button
                            className="px-3"
                            variant="danger"
                            onClick={() => handleDeleteFaq(faq.faqID)}
                          >
                            <p className="m-0">Delete</p>
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
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
            className="w-100 primaryButton px-5 py-2"
            onClick={handleAddFaq} // Rename handleAddFilter to handleAddFaq
          >
            <p className="m-0">Save</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
