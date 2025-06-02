import { React, useState, useEffect } from "react";
import axios from "axios";
import ImageModal from "./imageModal";

const DiaryDetails = ({ entry, user }) => {
  const [flaggedDiaryReasons, setFlaggedDiaryReasons] = useState([]);

  // FOR CLICKABLE IMAGE
  const [showModal, setShowModal] = useState(false);
  const handleShowModal = (entryID) => {
    setShowModal(true);
    // updateEngagement(entryID);
  };
  const handleCloseModal = () => setShowModal(false);

  useEffect(() => {
    const fetchFlaggedReasons = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/fetchFlaggedDiaryReasons"
        );
        // console.log("API Response:", response.data);
        setFlaggedDiaryReasons(response.data);
      } catch (error) {
        console.error("Error fetching alarming words:", error);
      }
    };

    fetchFlaggedReasons();
  }, []);
  return (
    <div className="mt-2">
      <div className="d-flex alig-items-center gap-1 position-relative">
        {entry.subjects === "None(no subject or topic)" ||
        entry.subjects === "General" ||
        entry.subjects === null ? null : (
          <h6 className="text-secondary m-0 ">
            <span style={{ fontSize: "clamp(0.7rem, 1dvw, .85rem)" }}>
              Trigger Warning: {entry.subjects}
            </span>
          </h6>
        )}
      </div>
      <div
        className="d-flex gap-1 align-items-center position-relative"
        style={{ zIndex: "20" }}
      >
        <div className="d-flex flex-column gap-1">
          <h5 className="m-0">{entry.title}</h5>
        </div>
        {entry.containsAlarmingWords === 1 && user.isAdmin ? (
          <div className="d-flex justify-content-center align-items-end pt-1 gap-1">
            <div className="informationToolTip accordion text-danger align-middle">
              <h4 className="m-0">
                <i class="bx bx-error" style={{}}></i>
              </h4>
              <p
                className="infToolTip rounded p-2 m-0 text-center"
                style={{
                  backgroundColor: "rgb(179, 0, 0, .7)",
                  width: "85%",
                }}
              >
                This diary entry has been flagged by the system as potentially
                containing sensitive or distressing topics and may require
                immediate attention.
              </p>
            </div>
          </div>
        ) : null}
        {entry.isFlagged && user.isAdmin ? (
          <div className="d-flex justify-content-center align-items-end pt-1 gap-1">
            <div className="informationToolTip accordion text-danger align-middle">
              <h4 className="m-0">
                <i class="bx bx-flag" style={{}}></i>
              </h4>
              <p
                className="infToolTip rounded p-2 m-0 text-center"
                style={{
                  backgroundColor: "rgb(179, 0, 0, .7)",
                  width: "85%",
                }}
              >
                Flagged: {entry.flagCount}
                {flaggedDiaryReasons && flaggedDiaryReasons.length > 0 ? (
                  Object.entries(
                    flaggedDiaryReasons
                      .filter(
                        (flaggedReason) =>
                          flaggedReason.entryID === entry.entryID
                      )
                      .reduce((count, flaggedReason) => {
                        count[flaggedReason.reason] =
                          (count[flaggedReason.reason] || 0) + 1;
                        return count;
                      }, {})
                  ).map(([reason, count]) => (
                    <div key={reason}>
                      <p className="m-0">
                        {reason} x{count}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="m-0">No reason available</p>
                )}
              </p>
            </div>
          </div>
        ) : null}
      </div>
      <p className="m-0 text-start" style={{ whiteSpace: "pre-wrap" }}>
        {entry.description}
      </p>
    </div>
  );
};

export default DiaryDetails;
