import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import axios from "axios";
import MessageModal from "../DiaryEntry/messageModal";

function Suspend({ profileOwner }) {
  const [show, setShow] = useState(false);
  const [reasons, setReasons] = useState([]);
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("3 Days");

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

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSuspend = async () => {
    try {
      const response = await axios.post("http://localhost:8081/suspendUser", {
        userID: profileOwner.userID,
        reason: selectedReason,
        period: selectedPeriod,
      });

      handleClose();
      setModal({
        show: true,
        message: `${profileOwner.firstName} ${profileOwner.lastName} has been suspended.`,
      });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error suspending user:", error);
      setModal({
        show: true,
        message: `An error occurred while suspending the user.`,
      });
    }
  };

  useEffect(() => {
    const fetchReasons = async () => {
      try {
        const response = await axios.get("http://localhost:8081/reportUsers");
        setReasons(response.data);
      } catch (error) {
        console.error("Error fetching reasons:", error);
      }
    };

    fetchReasons();
  }, []);

  return (
    <>
      <button
        className="btn btn-light w-100 d-flex align-items-center justify-content-center gap-1"
        onClick={handleShow}
        disabled={profileOwner.isSuspended}
      >
        <i className="bx bx-block"></i>
        <p className="m-0">
          {profileOwner.isSuspended ? "Suspended" : "Suspend"}
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
            <h4>
              Suspend {profileOwner.firstName} {profileOwner.lastName}
            </h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-danger">
            <h5>Number of Offense: {profileOwner.reportCount}</h5>
          </div>
          <div className="d-flex flex-column gap-2">
            <div className="form-floating">
              <select
                className="form-select"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="3 Days">3 Days</option>
                <option value="3 Weeks">3 Weeks</option>
                <option value="3 Months">3 Months</option>
                <option value="1 Year">1 Year</option>
              </select>
              <label>Suspension Period</label>
            </div>
            <div className="form-floating">
              <select
                className="form-select"
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
              >
                <option value="" disabled>
                  Select a reason
                </option>
                {reasons.map((reason) => (
                  <option key={reason.reportingUserID} value={reason.reason}>
                    {reason.reason}
                  </option>
                ))}
              </select>
              <label>Reason</label>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <button
            className="primaryButton py-2 rounded"
            onClick={handleSuspend}
          >
            Suspend
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Suspend;
