import { React, useState } from "react";
import axios from "axios";
import { Modal } from "react-bootstrap";
import MessageModal from "./messageModal";
import { useNavigate } from "react-router-dom";
import MessageAlert from "./messageAlert";

const DeleteButton = ({ entryID, title }) => {
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState(false);
  const [modal, setModal] = useState({ show: false, message: "" });
  const closeModal = () => {
    setModal({ show: false, message: "" });
  };

  const handleShowDeleteDiary = () => setDeleteModal(true);
  const handleCloseDelete = () => setDeleteModal(false);

  const handleDeleteEntry = async (entryID) => {
    setDeleteModal(false);
    try {
      await axios.delete(`http://localhost:8081/deleteEntry/${entryID}`);
      setModal({
        show: true,
        message: "Diary entry deleted successfully.",
      });

      // Wait for the user to acknowledge the success message
      setTimeout(() => {
        // Navigate or reload page here after confirmation
        // navigate({ location });
        window.location.reload();
      }, 1500); // Delay reload for 1.5 seconds after success modal
    } catch (error) {
      console.error("Error deleting diary entry:", error);
      alert("Failed to delete the entry.");
    }
  };

  return (
    <>
      <MessageModal
        showModal={modal}
        closeModal={closeModal}
        title={"Notice"}
        message={modal.message}
      ></MessageModal>
      <button
        className="btn btn-light w-100 d-flex align-items-center justify-content-center gap-1"
        onClick={handleShowDeleteDiary}
      >
        <i className="bx bx-message-square-x m-0 ms-1"></i>
        <p className="m-0">Delete</p>
      </button>
      <Modal show={deleteModal} onHide={handleCloseDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <h5 className="m-0">
              Are you sure you want to delete this diary entry?
            </h5>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Delete diary with the title:{" "}
            <span className="fw-bolder">{title}</span>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-secondary py-2"
            onClick={handleCloseDelete}
          >
            <p className="m-0">Cancel</p>
          </button>
          <button
            className="primaryButton py-2 d-flex align-items-center justify-content-center"
            onClick={() => handleDeleteEntry(entryID)}
          >
            <p className="m-0">Confirm</p>
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DeleteButton;
