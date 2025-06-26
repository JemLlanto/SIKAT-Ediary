import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import axios from "axios";
import Swal from "sweetalert2";

function ReviewedComment({ fetchComments, comment }) {
  const [show, setShow] = useState(false);

  const handleReviewed = async (commentID) => {
    try {
      await axios.put(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/commentAddress/${commentID}`
      );

      Swal.fire({
        icon: "success",
        title: "Marked as Reviewed",
        text: "The comment has been successfully marked as reviewed.",
        timer: 5000,
        showConfirmButton: true,
      }).then(() => {
        fetchComments();
        handleClose();
      });
    } catch (error) {
      console.error("Error updating reviewed:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to mark the comment as reviewed.",
      });
    }
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      {comment.isReported ? (
        <button
          className="btn btn-light w-100 d-flex align-items-center justify-content-center gap-1"
          disabled={comment.isReviewed}
          onClick={handleShow}
          // disabled={suspended}
        >
          <i className="bx bx-message-alt-check"></i>{" "}
          <p className="m-0">
            {comment.isReviewed ? "Reviewed" : "Mark as Reviewed"}
          </p>
        </button>
      ) : null}

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 className="m-0">Notice!</h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="m-0">
            Are you sure you want to mark this comment as reviewed?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            <p className="m-0">Cancel</p>
          </Button>
          <button
            className="primaryButton py-2 rounded"
            onClick={() => handleReviewed(comment.commentID)}
          >
            <p className="m-0">Confirm</p>
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ReviewedComment;
