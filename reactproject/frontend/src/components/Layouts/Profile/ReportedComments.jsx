import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";

const ReportedComments = ({ userID }) => {
  const [showModal, setShowModal] = useState(false);
  const [reportedComments, setReportedComments] = useState([]);
  const [reportedCount, setReportedCount] = useState(0);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const fetchReportedComments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8081/getReportedComments/${userID}`
      );
      setReportedCount(response.data.length); // Set the count based on the response
    } catch (error) {
      console.error("Error fetching reported comments:", error);
    }
  };

  useEffect(() => {
    fetchReportedComments(); // Fetch reported comments count on initial render
  }, [userID]);

  useEffect(() => {
    if (showModal) {
      axios
        .get(`http://localhost:8081/getReportedComments/${userID}`)
        .then((response) => {
          console.log("reported comments", response.data);
          setReportedComments(response.data);
          setReportedCount(response.data.length); // Update the count when the modal opens
        })
        .catch((error) => {
          console.error("Error fetching reported comments:", error);
        });
    }
  }, [showModal, userID]);

  return (
    <div>
      <button
        className="btn btn-danger py-1 px-3 d-flex align-items-center"
        onClick={handleShow}
        style={{ height: "100%" }}
      >
        <i class="bx bx-message-error d-sm-none"></i>
        <h5 className="m-0 d-none d-sm-block">
          Reported Comments: {reportedCount}
        </h5>
      </button>
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 className="m-0">Reported Comments</h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            className="overflow-y-scroll custom-scrollbar pe-1"
            style={{ height: "20rem" }}
          >
            {reportedComments.length > 0 ? (
              reportedComments.map((comment) => (
                <div key={comment.commentID}>
                  <Link
                    className="text-decoration-none text-dark"
                    to={`/DiaryEntry/${comment.entryID}`}
                  >
                    <h5
                      className="m-0 grayHover px-3 py-2 rounded"
                      style={{ backgroundColor: "transparent" }}
                    >
                      {comment.text} -
                      {/* Reported by: {comment.reporterFirstName}{" "}
                      {comment.lastName} */}
                    </h5>
                  </Link>
                </div>
              ))
            ) : (
              <p>No reported comments found.</p>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ReportedComments;
