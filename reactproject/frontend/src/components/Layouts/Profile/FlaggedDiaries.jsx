import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";

const FlaggedDiaries = ({ userID }) => {
  const [showModal, setShowModal] = useState(false);
  const [flaggedDiaries, setFlaggedDiaries] = useState([]);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [reportedComments, setReportedComments] = useState([]);
  const [reportedCount, setReportedCount] = useState(0);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  useEffect(() => {
    fetchFlag();
    fetchReportedComments();
  }, []);

  const fetchFlag = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8081/flagged/${userID}`
      );
      setFlaggedCount(response.data.length);
    } catch (error) {
      console.error("Error fetching flagged diaries:", error);
    }
  };

  useEffect(() => {
    if (showModal) {
      axios
        .get(`http://localhost:8081/flagged/${userID}`)
        .then((response) => {
          console.log("flag", response.data);
          setFlaggedDiaries(response.data);
          setFlaggedCount(response.data.length); // Update the count here as well
        })
        .catch((error) => {
          console.error("Error fetching flagged diaries:", error);
        });
    }
  }, [showModal, userID]);

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

  return (
    <div>
      <button
        className="btn btn-danger py-2 px-3"
        onClick={handleShow}
        style={{ height: "100%" }}
      >
        <h5 className="m-0">Flagged Diaries: {flaggedCount}</h5>
      </button>
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 className="m-0">Flagged Diaries</h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            className="overflow-y-scroll custom-scrollbar pe-1"
            style={{ height: "20rem" }}
          >
            {flaggedDiaries.length > 0 ? (
              flaggedDiaries.map((diary) => (
                <div key={diary.entryID}>
                  <Link
                    className="text-decoration-none text-dark"
                    to={`/DiaryEntry/${diary.entryID}`}
                  >
                    <h5
                      className="m-0 grayHover px-3 py-2 rounded"
                      style={{ backgroundColor: "transparent" }}
                    >
                      {diary.title} - {diary.reasons}
                    </h5>
                  </Link>
                </div>
              ))
            ) : (
              <p>No flagged diaries found.</p>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default FlaggedDiaries;
