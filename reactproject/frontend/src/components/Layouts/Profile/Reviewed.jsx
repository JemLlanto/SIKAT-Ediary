import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import axios from "axios";
import MessageAlert from "../DiaryEntry/messageAlert";
import MessageModal from "../DiaryEntry/messageModal";

function Reviewed({ entry }) {
  const [show, setShow] = useState(false);
  const [modal, setModal] = useState({ show: false, message: "" });

  const closeModal = () => {
    setModal({ show: false, message: "" });
  };

  const handleReviewed = async (entryID) => {
    try {
      await axios.put(`http://localhost:8081/flaggedAddress/${entryID}`, {
        entryID,
      });

      // Close the modal after success
      handleClose();

      // Show confirmation message
      setModal({
        show: true,
        message: `Flagged diary has been addressed.`,
      });

      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error updating reviewed:", error);
      setModal({
        show: true,
        message: "Failed to update entry. Please try again.",
      });
    }
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <button
        className="btn btn-light w-100 d-flex align-items-center justify-content-center gap-1"
        disabled={entry.isAddress}
        onClick={handleShow}
      >
        <i className="bx bx-message-alt-check"></i>{" "}
        <p className="m-0">
          {entry.isAddress ? "Reviewed" : "Mark as Reviewed"}
        </p>
      </button>

      <MessageModal
        showModal={modal}
        closeModal={closeModal}
        title={"Notice"}
        message={modal.message}
      ></MessageModal>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 className="m-0">Notice!</h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="m-0">Are you sure you want to mark this as reviewed?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            <p className="m-0">Cancel</p>
          </Button>
          <button
            className="primaryButton py-2 rounded"
            onClick={() => handleReviewed(entry.entryID)}
          >
            <p className="m-0">Confirm</p>
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Reviewed;
