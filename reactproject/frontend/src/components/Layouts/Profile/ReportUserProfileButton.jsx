import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import axios from "axios";
import MessageModal from "../DiaryEntry/messageModal";
import MessageAlert from "../DiaryEntry/messageAlert";

function ReportUserButton({ user, profileOwner }) {
  const [show, setShow] = useState(false);
  const [selectedBehavior, setSelectedBehavior] = useState("");
  const [otherText, setOtherText] = useState("");
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [reportComments, setReportComments] = useState([]);

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

  // Fetch report comments from the backend
  useEffect(() => {
    const fetchReportComments = async () => {
      try {
        const response = await axios.get("http://localhost:8081/reportUsers");
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
      const response = await axios.post("http://localhost:8081/reportingUser", {
        reportedUserID: profileOwner.userID,
        reason: selectedBehavior,
      });

      if (response.status === 200) {
        setModal({
          show: true,
          message: `Your report has been submitted.`,
        });
        handleClose(); // Close the modal after successful submission
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      setModal({
        show: true,
        message: `There was an error submitting your report.`,
      });
    }
  };

  return (
    <>
      <button
        className="btn btn-light w-100 d-flex align-items-center justify-content-center gap-1"
        onClick={handleShow}
      >
        <i class="bx bx-error"></i>
        <p className="m-0">Report</p>
      </button>

      <MessageModal
        showModal={modal}
        closeModal={closeModal}
        title={"Notice"}
        message={modal.message}
      ></MessageModal>
      <MessageModal
        showModal={confirmModal}
        closeModal={closeConfirmModal}
        title={"Confirmation"}
        message={confirmModal.message}
        confirm={confirmModal.onConfirm}
        needConfirm={1}
      ></MessageModal>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 className="m-0">
              Report {profileOwner.firstName} {profileOwner.lastName}
            </h4>
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
          >
            <p className="m-0">Report User</p>
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ReportUserButton;
