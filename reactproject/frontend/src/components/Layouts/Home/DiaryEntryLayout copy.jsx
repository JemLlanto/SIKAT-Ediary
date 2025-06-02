import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import anonymous from "../../../assets/anonymous.png";
import userDefaultProfile from "../../../assets/userDefaultProfile.png";
import TransparentLogo from "../../../assets/TransparentLogo.png";
import CommentSection from "../CommentSection/CommentSection";
import Dropdown from "react-bootstrap/Dropdown";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import axios from "axios";
import FlagButton from "./FlagButton";

const DiaryEntryLayout = ({
  entry,
  user,
  followedUsers,
  handleFollowToggle,
  handleClick,
  expandButtons,
  formatDate,
}) => {
  const { userID } = useParams();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]); // New state for comments
  const [filters, setFilters] = useState({
    sexualHarassment: false,
    domesticAbuse: false,
    genderRelated: false,
  });
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  cosnt[(showModal, setShowModal)] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/");
      return;
    }
    setCurrentUser(storedUser);
  }, [navigate]);

  // useEffect(() => {
  //   if (!userID || !currentUser) return;

  //   const fetchUserData = async () => {
  //     try {
  //       const response = await fetch(
  //         `http://localhost:8081/fetchUser/user/${userID}`
  //       );

  //       if (!response.ok) {
  //         throw new Error("User not found");
  //       }
  //       const data = await response.json();
  //       setEntries(data);
  //     } catch (err) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchUserData();
  // }, [userID, currentUser]);

  useEffect(() => {
    if (user) {
      fetchEntries(user.userID, filters);
    }
  }, [user, filters]);

  useEffect(() => {
    if (entry.entryID) {
      // Fetch comments for the entry
      const fetchComments = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8081/fetchComments/${entry.entryID}`
          );
          setComments(response.data);
        } catch (error) {
          console.error("Error fetching comments:", error);
        }
      };
      fetchComments();
    }
  }, [entry.entryID]);

  const fetchEntries = async (userID, filters) => {
    try {
      const response = await axios.get("http://localhost:8081/entries", {
        params: { userID, filters },
      });

      const gadifyStatusResponse = await axios.get(
        `http://localhost:8081/gadifyStatus/${userID}`
      );

      const updatedEntries = response.data.map((entry) => {
        const isGadified = gadifyStatusResponse.data.some(
          (g) => g.entryID === entry.entryID
        );
        return { ...entry, isGadified };
      });

      setEntries(updatedEntries);
    } catch (error) {
      console.error("Error fetching diary entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryID) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this entry?"
    );
    if (confirmed) {
      try {
        await axios.delete(`http://localhost:8081/deleteEntry/${entryID}`);
        alert("Diary entry deleted successfully.");
        window.location.reload();
        setEntries((prevEntries) =>
          prevEntries.filter((entry) => entry.entryID !== entryID)
        );
      } catch (error) {
        console.error("Error deleting diary entry:", error);
        alert("Failed to delete the entry.");
      }
    }
  };

  if (loading) {
    return (
      <div
        className="position-relative rounded shadow-sm p-3 mb-2"
        style={{ backgroundColor: "white" }}
      >
        <div className="position-absolute" style={{ right: "20px" }}>
          {/* <HomeDiaryDropdown></HomeDiaryDropdown> */}
        </div>
        <div className="d-flex align-items-center border-bottom pb-2 gap-2">
          <div className="profilePicture" style={{ backgroundColor: "#ffff" }}>
            <img
              src={userDefaultProfile}
              alt="Profile"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
          <p
            className="m-0 mt-2"
            style={{
              height: "14px",
              width: "70px",
              backgroundColor: "lightgray",
              marginBottom: "10px", // Optional, adds space between divs
            }}
          ></p>

          <p
            className="m-0 mt-2"
            style={{
              height: "14px",
              width: "50px",
              backgroundColor: "lightgray",
              marginBottom: "10px", // Optional, adds space between divs
            }}
          ></p>
        </div>

        <div className="text-start border-bottom p-2">
          <h5
            className="m-0 mt-2"
            style={{
              height: "20px",
              width: "190px",
              backgroundColor: "lightgray",
              marginBottom: "10px", // Optional, adds space between divs
            }}
          ></h5>
          <div>
            <p
              className="m-0 mt-3"
              style={{
                height: "14px",
                width: "100%",
                backgroundColor: "lightgray",
                marginBottom: "10px", // Optional, adds space between divs
              }}
            ></p>
            <p
              className="m-0 mt-3"
              style={{
                height: "14px",
                width: "100%",
                backgroundColor: "lightgray",
                marginBottom: "10px", // Optional, adds space between divs
              }}
            ></p>
            <p
              className="m-0 mt-3"
              style={{
                height: "14px",
                width: "50%",
                backgroundColor: "lightgray",
                marginBottom: "10px", // Optional, adds space between divs
              }}
            ></p>
          </div>
        </div>

        <div className="row pt-2">
          <div className="col">
            <button className="InteractButton">
              <p
                className="m-0 my-2"
                style={{
                  height: "14px",
                  width: "100%",
                  backgroundColor: "lightgray",
                  marginBottom: "10px", // Optional, adds space between divs
                }}
              ></p>
            </button>
          </div>
          <div className="col">
            <button className="InteractButton">
              <p
                className="m-0 my-2"
                style={{
                  height: "14px",
                  width: "100%",
                  backgroundColor: "lightgray",
                  marginBottom: "10px", // Optional, adds space between divs
                }}
              ></p>
            </button>
          </div>
          <div className="col">
            <button className="InteractButton">
              <p
                className="m-0 my-2"
                style={{
                  height: "14px",
                  width: "100%",
                  backgroundColor: "lightgray",
                  marginBottom: "10px", // Optional, adds space between divs
                }}
              ></p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ownDiary = currentUser?.userID === entry.userID;

  return (
    <div
      key={entry.entryID}
      className="position-relative rounded shadow-sm p-3 mb-2"
      style={{ backgroundColor: "white", width: "100%" }}
    >
      <div className="d-flex align-items-start justify-content-between border-bottom pb-2">
        {entry.anonimity === "private" ? (
          <div className="d-flex align-items-center gap-2">
            <div className="profilePicture">
              <img
                src={
                  entry.isAdmin === 1
                    ? `http://localhost:8081${entry.profile_image}`
                    : anonymous
                }
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <div className="d-flex flex-column align-items-start">
              {entry.isAdmin === 1 ? "Gender and Development" : entry.alias}
              <p className="m-0" style={{ fontSize: ".7rem" }}>
                {formatDate(entry.created_at)}
              </p>
            </div>
          </div>
        ) : (
          <Link to={`/Profile/${entry.userID}`} className="linkText rounded">
            <div className="d-flex align-items-center gap-2">
              <div className="profilePicture">
                <img
                  src={
                    entry.profile_image
                      ? `http://localhost:8081${entry.profile_image}`
                      : userDefaultProfile
                  }
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div className="d-flex flex-column align-items-start">
                <div className="d-flex align-items-center justify-content-center gap-1">
                  <h5 className="m-0 text-start">
                    {entry.isAdmin === 1
                      ? "Gender and Development"
                      : entry.firstName && entry.lastName
                      ? entry.firstName + " " + entry.lastName
                      : user.firstName + " " + user.lastName}
                  </h5>
                  {user &&
                    user.userID !== entry.userID &&
                    entry.anonymity !== "private" &&
                    entry.isAdmin !== 1 && (
                      <div className="d-flex align-items-center gap-1">
                        <h3
                          className="m-0 text-secondary d-flex align-items-center"
                          style={{ height: ".9rem" }}
                        >
                          ·
                        </h3>
                        <button
                          className="secondaryButton p-0 m-0"
                          onClick={() => handleFollowToggle(entry.userID)}
                          style={{ height: "" }}
                        >
                          <h5 className="m-0">
                            {followedUsers.includes(entry.userID)
                              ? "Following"
                              : "Follow"}
                          </h5>{" "}
                        </button>
                      </div>
                    )}
                </div>
                <p className="m-0" style={{ fontSize: ".7rem" }}>
                  {formatDate(entry.created_at)}
                </p>
              </div>
            </div>
          </Link>
        )}

        <div>
          {ownDiary ? (
            <Dropdown>
              <Dropdown.Toggle
                className="btn-light d-flex align-items-center pt-0 pb-2"
                id="dropdown-basic"
                bsPrefix="custom-toggle"
              >
                <h5 className="m-0">...</h5>
              </Dropdown.Toggle>
              <Dropdown.Menu className="p-2">
                <Dropdown.Item className="p-0 btn btn-light">
                  Edit
                </Dropdown.Item>
                <Dropdown.Item
                  className="p-0 btn btn-light"
                  onClick={() => handleDeleteEntry(entry.entryID)}
                >
                  Delete
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <p></p>
          )}
        </div>
      </div>

      <div
        className="text-start border-bottom py-2 pt-2"
        style={{ minHeight: "5rem" }}
      >
        <div className="d-flex alig-items-center gap-1 position-relative">
          {entry.subjects && (
            <h6 className="text-secondary m-0 mt-2">
              Trigger Warning: {entry.subjects}
            </h6>
          )}
          {entry.containsAlarmingWords === 1 && user.isAdmin === 1 ? (
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
          ) : (
            <></>
          )}
        </div>

        <div className="d-flex gap-1 align-items-center mt-2">
          <div className="d-flex flex-column gap-1">
            <h5 className="m-0">{entry.title}</h5>
          </div>
        </div>

        <p style={{ whiteSpace: "pre-wrap" }}>{entry.description}</p>

        {/* Clickable Image */}
        {entry.diary_image && (
          <>
            <img
              className="DiaryImage mt-1 rounded"
              src={`http://localhost:8081${entry.diary_image}`}
              alt="Diary"
              style={{ cursor: "pointer" }} // Add pointer cursor
              onClick={handleShowModal} // Open modal on click
            />

            {/* Modal */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
              <Modal.Header closeButton>
                <Modal.Title>Diary Image</Modal.Title>
              </Modal.Header>
              <Modal.Body className="text-center">
                <img
                  src={`http://localhost:8081${entry.diary_image}`}
                  alt="Diary Full View"
                  className="img-fluid rounded"
                  style={{ maxHeight: "80vh" }}
                />
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          </>
        )}
      </div>
      <div className="row px-2 pt-2 gap-1">
        <div className="col p-0">
          <button
            className={`InteractButton d-flex align-items-center justify-content-center gap-1 ${
              entry.isGadified ? "active" : ""
            } ${expandButtons[entry.entryID] ? "expand" : ""}`}
            onClick={() => handleClick(entry.entryID)}
          >
            {entry.isGadified ? (
              <i className="bx bxs-heart"></i>
            ) : (
              <i className="bx bx-heart"></i>
            )}
            <span>{entry.gadifyCount}</span>
            <p className="m-0 d-none d-md-block">Gadify</p>
          </button>
        </div>

        {/* <div className="row pt-2">
          <div className="col">
            <i className="bx bx-comment"></i>
            {comments.length}
          </div> */}

        <div className="col p-0">
          <CommentSection
            userID={user.userID}
            entryID={entry.entryID}
            entry={entry.userID}
            firstName={entry.firstName}
          />
        </div>

        <div className="col p-0">
          <FlagButton
            userID={user.userID}
            entryID={entry.entryID}
            entry={entry.userID}
          />
        </div>
      </div>
    </div>
  );
};

export default DiaryEntryLayout;
