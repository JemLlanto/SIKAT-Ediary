import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import axios from "axios";
import MessageModal from "../DiaryEntry/messageModal";

function Reviewed({ profileOwner }) {
  const [show, setShow] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [modal, setModal] = useState({ show: false, message: "" });
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
  });

  // useEffect(() => {
  //   const fetchReview = async () => {
  //     try {
  //       const response = await axios.get(
  //         `http://localhost:8081/getReportedUser/${userID}`
  //       );
  //       setReviews(response.data);
  //       setShow(false);
  //     } catch (error) {
  //       console.error("Error fetching reviews:", error);
  //     }
  //   };

  //   fetchReview();
  // }, []);

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

  const handleReviewed = async (userID) => {
    try {
      await axios.put(`http://localhost:8081/reviewedProfile/${userID}`);
      handleClose();
      setModal({
        show: true,
        message: `${profileOwner.firstName} ${profileOwner.lastName} has been reviewed.`,
      });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error updating reviewed:", error);
    }
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <button
        className="btn btn-light w-100 d-flex align-items-center justify-content-center gap-1"
        disabled={profileOwner.isReviewed}
        onClick={() => handleShow()}
      >
        <i className="bx bx-message-alt-check"></i>
        <p className="m-0">
          {profileOwner.isReviewed ? "Reviewed" : "Mark as reviewed"}
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
            onClick={() => handleReviewed(profileOwner.userID)}
          >
            <p className="m-0">Confirm</p>
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Reviewed;
