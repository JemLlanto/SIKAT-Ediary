import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import anonymous from "../../../assets/anonymous.png";
import userDefaultProfile from "../../../assets/userDefaultProfile.png";
import CommentSection from "../CommentSection/CommentSection";
import Dropdown from "react-bootstrap/Dropdown";
import axios from "axios";
import FlagButton from "./FlagButton";
import ChatButton from "../DiaryEntry/ChatButton";
import EditDiaryEntryButton from "./EditDiaryEntryButton";
import EditPostButton from "./EditPostButton";
import DeleteButton from "../DiaryEntry/DeleteButton";
import ImageModal from "../DiaryEntry/imageModal";
import Suspend from "../Profile/Suspend";
import DiaryEntryHeader from "../DiaryEntry/DiaryEntryHeader";
import FollowButton from "../DiaryEntry/FollowButton";
import DiaryDetails from "../DiaryEntry/DiaryDetails";

const DiaryEntryLayout = ({
  entry,
  user,
  followedUsers,
  handleFollowToggle,
  handleClick,
  expandButtons,
  formatDate,
  suspended,
}) => {
  const { userID } = useParams();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]); // New state for comments
  const [flaggedCount, setFlaggedCount] = useState(null);
  const [filters, setFilters] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const handleShowModal = (entryID) => {
    setShowModal(true);
    updateEngagement(entryID);
  };
  const handleCloseModal = () => setShowModal(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/");
      return;
    }
    setCurrentUser(storedUser);
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchEntries(user.userID, filters);
    }
  }, [user, filters]);

  useEffect(() => {
    if (entry.entryID) {
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

  const commentCount = comments.length;

  useEffect(() => {
    if (entry.entryID) {
      const fetchFlaggedCount = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8081/flaggedCount/${entry.entryID}`
          );
          const count = response.data.flaggedCount;
          setFlaggedCount(count);
        } catch (error) {
          console.error("Error fetching flagged count:", error);
        }
      };
      fetchFlaggedCount();
    }
  }, [entry.entryID]);

  useEffect(() => {
    if (entry.entryID) {
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
        setEntries((prevEntries) =>
          prevEntries.filter((entry) => entry.entryID !== entryID)
        );
      } catch (error) {
        console.error("Error deleting diary entry:", error);
        alert("Failed to delete the entry.");
      }
    }
  };

  const updateEngagement = async (entryID) => {
    try {
      await axios.post("http://localhost:8081/updateEngagement", {
        entryID,
      });
    } catch (error) {
      console.error("Error updating engagement:", error);
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
      <DiaryEntryHeader
        entry={entry}
        user={user}
        formatDate={formatDate}
        ownDiary={ownDiary}
        currentUser={currentUser}
        FollowButton={FollowButton}
        followedUsers={followedUsers}
        handleFollowToggle={handleFollowToggle}
      />

      <DiaryDetails
        user={user}
        entry={entry}
        entryImage={`http://localhost:8081${entry.diary_image}`}
      />

      <div
        className="text-start border-bottom py-2 pt-2"
        style={{ minHeight: "" }}
      >
        {/* Clickable Image */}
        {entry.diary_image && (
          <>
            <img
              className="DiaryImage mt-1 rounded"
              src={`http://localhost:8081${entry.diary_image}`}
              alt="Diary"
              style={{ cursor: "pointer" }} // Add pointer cursor
              onClick={() => handleShowModal(entry.entryID)} // Open modal on click
            />

            {/* Modal */}
            <ImageModal
              showModal={showModal}
              handleCloseModal={handleCloseModal}
              diaryImage={`http://localhost:8081${entry.diary_image}`}
            ></ImageModal>
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
            commentCount={commentCount}
            userID={currentUser.userID}
            entryID={entry.entryID}
            entry={entry.userID}
            firstName={entry.firstName}
            isAnon={entry.anonimity}
            alias={entry.alias}
          />
          {/* {entry.isFlagged} */}
        </div>

        <div className="col p-0">
          {user.isAdmin ? (
            <ChatButton
              user={user}
              entry={entry}
              userToChat={entry.userID}
            ></ChatButton>
          ) : (
            <FlagButton
              firstName={entry.firstName}
              isAnon={entry.anonimity}
              alias={entry.alias}
              flaggedCount={flaggedCount}
              userID={user.userID}
              entryID={entry.entryID}
              entry={entry.userID}
              fromAdmin={entry.isAdmin}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DiaryEntryLayout;
