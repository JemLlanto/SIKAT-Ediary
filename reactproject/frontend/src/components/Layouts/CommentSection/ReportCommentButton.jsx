import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import axios from "axios";
import Swal from "sweetalert2";

function ReportCommentButton({
  comment,
  ownComment,
  isAnon,
  alias,
  commentID,
  userID,
  firstName,
  entryID,
}) {
  const [show, setShow] = useState(false);
  const [selectedBehavior, setSelectedBehavior] = useState("");
  const [otherText, setOtherText] = useState("");
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [reportComments, setReportComments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch report comments from the backend
  useEffect(() => {
    const fetchReportComments = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/reportComments`
        );
        setReportComments(response.data);
      } catch (err) {
        console.error("Error fetching report comments:", err);
      }
    };

    fetchReportComments();
  }, []);

  const handleClose = () => {
    setShow(false);
    setSelectedBehavior("");
    setOtherText("");
    setIsOtherSelected(false);
  };

  const handleShow = () => setShow(true);

  const handleSelectChange = (event) => {
    const value = event.target.value;
    setSelectedBehavior(value);
    setIsOtherSelected(value === "Others");
  };

  const handleOtherTextChange = (event) => {
    setOtherText(event.target.value);
  };

  const handleSubmitReport = async () => {
    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/reportuserComment`,
        {
          commentID,
          userID,
          entryID,
          reason: selectedBehavior,
        }
      );

      if (response.status === 200) {
        handleClose();
        await Swal.fire({
          icon: "success",
          title: "Reported!",
          text: "Comment reported successfully.",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "There was an error submitting your report.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        className="btn btn-light w-100 d-flex align-items-center justify-content-center gap-1"
        onClick={handleShow}
        disabled={comment.isReviewed}
      >
        <p className="m-0">
          {comment.isReviewed
            ? "This comment has been reviewed by admin/s."
            : "Report"}
        </p>
        {comment.isReviewed ? (
          <>
            <i className="bx bx-check"></i>
          </>
        ) : (
          <>
            <i className="bx bx-error"></i>
          </>
        )}
      </button>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <h5 className="m-0">
              Report {isAnon && ownComment ? alias : firstName}'s Comment
            </h5>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{}}>
          <div>
            <label className="d-flex gap-2 mb-3">
              <h5 className="m-0">Reason: </h5>
              {selectedBehavior && (
                <h5 className="m-0 text-danger">{selectedBehavior}</h5>
              )}
            </label>
            <div className="d-flex flex-column gap-2">
              <select
                className="form-select"
                value={selectedBehavior}
                onChange={handleSelectChange}
              >
                <option value="" disabled>
                  Select a reason
                </option>
                {/* Dynamically create options from fetched data */}
                {reportComments.map((comment, index) => (
                  <option key={index} value={comment.comment_title}>
                    {comment.reason}
                  </option>
                ))}
                {/* <option value="Others">Others</option> */}
              </select>
              {/* {isOtherSelected && (
                <input
                  type="text"
                  className="form-control mt-2"
                  placeholder="Please specify"
                  value={otherText}
                  onChange={handleOtherTextChange}
                />
              )} */}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            <p className="m-0">Cancel</p>
          </Button>
          <button
            className="primaryButton py-2 rounded"
            onClick={handleSubmitReport}
            disabled={isSubmitting}
          >
            <p className="m-0">{isSubmitting ? <>Saving</> : <>Confirm</>}</p>
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ReportCommentButton;
