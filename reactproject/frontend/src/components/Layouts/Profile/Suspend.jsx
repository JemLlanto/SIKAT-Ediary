import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import axios from "axios";
import Swal from "sweetalert2";

function Suspend({ fetchComments, profileOwner }) {
  const [show, setShow] = useState(false);
  const [reasons, setReasons] = useState([]);
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("3 Days");
  const [isLoading, setIsLoading] = useState(false);
  const [suspended, setSuspended] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSuspend = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/suspendUser`,
        {
          userID: profileOwner.userID,
          reason: selectedReason,
          period: selectedPeriod,
        }
      );
      if (profileOwner.isReported && profileOwner.commentID) {
        const commentID = profileOwner.commentID;
        console.log("marking as reviewed: ", commentID);
        const responseMark = await axios.put(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/commentAddress/${commentID}`
        );
      }

      handleClose();

      Swal.fire({
        icon: "success",
        title: "User Suspended",
        text: `${profileOwner.firstName} ${profileOwner.lastName} has been suspended.`,
        timer: 5000,
        showConfirmButton: true,
      }).then(() => {
        setSuspended(profileOwner.userID);
        fetchComments();
      });
    } catch (error) {
      console.error("Error suspending user:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while suspending the user.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchReasons = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/reportingUserAPI/reportUsers`
        );
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
        disabled={profileOwner.isSuspended || suspended === profileOwner.userID}
      >
        <i className="bx bx-block"></i>
        <p className="m-0">
          {profileOwner.isSuspended || suspended === profileOwner.userID
            ? "Suspended"
            : "Suspend"}
        </p>
      </button>

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
            <h5>
              Number of Offense: {profileOwner.reportCount}
              {/* {profileOwner.commentID} */}
            </h5>
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
            <p className="m-0">Cancel</p>
          </Button>
          <button
            className="primaryButton py-2 rounded"
            onClick={handleSuspend}
            disabled={isLoading || selectedReason === ""}
          >
            <p className="m-0">{isLoading ? "Saving" : "Suspend"}</p>
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Suspend;
