import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import MessageModal from "../DiaryEntry/messageModal";

function FlagButton({
  userID,
  firstName,
  alias,
  isAnon,
  entryID,
  entry,
  flaggedCount,
  fromAdmin,
}) {
  const [show, setShow] = useState(false);
  const [selectedReason, setSelectedReason] = useState([]);
  const [otherText, setOtherText] = useState("");
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [flaggingOptions, setFlaggingOptions] = useState([]);
  const otherInputRef = useRef(null);

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
    const fetchFlaggingOptions = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/flaggingOptions"
        );
        setFlaggingOptions(response.data);
      } catch (error) {
        console.error("Error fetching flagging options:", error);
      }
    };
    fetchFlaggingOptions();
  }, []);

  const handleClose = () => {
    setShow(false);
    setSelectedReason([]);
    setOtherText("");
    setIsOtherSelected(false);
  };

  const handleShow = () => setShow(true);

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;

    if (value === "others") {
      setIsOtherSelected(checked);
      if (checked) {
        // Focus on the "Others" input field when selected
        setTimeout(() => {
          otherInputRef.current?.focus();
        }, 0);
      }
    }

    setSelectedReason((prevSelected) =>
      checked
        ? [...prevSelected, value]
        : prevSelected.filter((reason) => reason !== value)
    );
  };

  const handleSubmit = async () => {
    const reportData = {
      userID: entry,
      entryID,
      reason: selectedReason,
    };

    console.log("Submitting report data:", reportData);

    try {
      const response = await axios.post(
        "http://localhost:8081/flags",
        reportData
      );

      if (response.status === 200) {
        // alert("Flagged successfully");
        setModal({
          show: true,
          message: `Flagged successfully`,
        });
        console.log("Report submitted successfully");
        updateEngagement(entryID);
        handleClose();
      } else {
        console.error("Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("There was an error submitting your report. Please try again.");
    }
  };

  const updateEngagement = async (entryID) => {
    try {
      await axios.post("http://localhost:8081/updateEngagement", { entryID });
    } catch (error) {
      console.error("Error updating engagement:", error);
    }
  };

  return (
    <>
      <button
        className="InteractButton d-flex align-items-center justify-content-center gap-2"
        onClick={handleShow}
        disabled={fromAdmin || entry === userID}
      >
        <i className="bx bx-flag"></i>
        <span>{flaggedCount}</span>
        <p className="m-0 d-none d-md-block">Flag</p>
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
            <h5 className="m-0">
              Flag {isAnon === "private" ? alias : firstName}'s Diary
            </h5>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ height: "clamp(17rem ,30dvw ,20rem)" }}>
            <label className="d-flex gap-2 mb-3">
              <h5 className="m-0">Reason: </h5>
              {selectedReason.length > 0 && (
                <h5 className="m-0">{selectedReason}</h5>
              )}
            </label>
            <div
              className="d-flex flex-column gap-2 custom-scrollbar pe-2"
              style={{ overflowY: "scroll", height: "90%" }}
            >
              {flaggingOptions.map((option) => (
                <label
                  className="border rounded p-2 d-flex align-items-center"
                  key={option.flagID}
                >
                  <input
                    type="radio"
                    name="flaggingOptions" // Ensures only one selection
                    id={option.flagID}
                    value={option.reason}
                    onChange={handleCheckboxChange}
                    className="me-2"
                  />
                  <p className="m-0">{option.reason}</p>
                </label>
              ))}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            <p className="m-0"> Cancel</p>
          </Button>
          <button className="primaryButton py-2 rounded" onClick={handleSubmit}>
            <p className="m-0">Flag</p>
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default FlagButton;
