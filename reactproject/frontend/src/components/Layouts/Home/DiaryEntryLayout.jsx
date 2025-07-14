import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import anonymous from "../../../assets/anonymous.png";
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
import DiaryLoader from "../../loaders/DiaryLoader";
import GadifyButton from "./GadifyButton";

const DiaryEntryLayout = ({
  entry,
  user,
  followedUsers,
  flaggingOptions,
  fetchFollowedUsers,
  setFollowedUsers,
}) => {
  const [entryData, setEntryData] = useState(entry);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]); // New state for comments
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
    if (!entry) return;

    setEntryData(entry);
  }, [entry]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/");
      return;
    }
    // console.log("Entry data on layout: ", entry);
    setCurrentUser(storedUser);
  }, [navigate]);

  // useEffect(() => {
  //   if (entryData.entryID) {
  //     const fetchComments = async () => {
  //       try {
  //         const response = await axios.get(
  //           `  ${
  //             import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
  //           }/fetchComments/${entryData.entryID}`
  //         );
  //         setComments(response.data);
  //       } catch (error) {
  //         console.error("Error fetching comments:", error);
  //       }
  //     };
  //     fetchComments();
  //   }
  // }, [entryData.entryID]);

  useEffect(() => {
    if (entryData.entryID) {
      const fetchComments = async () => {
        try {
          setLoading(true);
          const response = await axios.get(
            `  ${
              import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
            }/fetchComments/${entryData.entryID}`
          );
          setComments(response.data);
        } catch (error) {
          console.error("Error fetching comments:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchComments();
    }
  }, [entryData.entryID]);

  const updateEngagement = async (entryID) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/updateEngagement`,
        {
          entryID,
        }
      );
    } catch (error) {
      console.error("Error updating engagement:", error);
    }
  };

  const formatDate = (dateString) => {
    const entryDate = new Date(dateString);
    const now = new Date();
    const timeDiff = now - entryDate;

    if (timeDiff < 24 * 60 * 60 * 1000) {
      return entryDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return entryDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  if (loading) {
    return <DiaryLoader />;
  }

  const ownDiary = currentUser?.userID === entry?.userID;

  return (
    <div
      key={entryData.entryID}
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
        fetchFollowedUsers={fetchFollowedUsers}
        setFollowedUsers={setFollowedUsers}
      />
      <DiaryDetails
        user={user}
        entry={entry}
        entryImage={`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}${
          entryData.diary_image
        }`}
      />
      <div
        className="text-start border-bottom py-2 pt-2"
        style={{ minHeight: "" }}
      >
        {/* Clickable Image */}
        {entryData.diary_image && (
          <>
            <img
              className="DiaryImage mt-1 rounded"
              src={entryData.diary_image}
              alt="Diary"
              style={{ cursor: "pointer" }} // Add pointer cursor
              onClick={() => handleShowModal(entryData.entryID)} // Open modal on click
            />

            {/* Modal */}
            <ImageModal
              showModal={showModal}
              handleCloseModal={handleCloseModal}
              diaryImage={entryData.diary_image}
            ></ImageModal>
          </>
        )}
      </div>
      <div className="row px-2 pt-2 gap-1">
        <div className="col p-0">
          <GadifyButton
            entry={entryData}
            user={user}
            entries={entries}
            setEntryData={setEntryData}
          />
        </div>

        <div className="col p-0">
          <CommentSection
            user={user}
            entryData={entryData}
            commentCount={comments.length}
            userID={currentUser?.userID}
            entryID={entryData.entryID}
            entry={entryData.userID}
            firstName={entryData.firstName}
            isAnon={entryData.anonimity}
            alias={entryData.alias}
          />
        </div>

        <div className="col p-0">
          {user.isAdmin ? (
            <ChatButton
              user={user}
              entry={entryData}
              userToChat={entryData.userID}
            ></ChatButton>
          ) : (
            <FlagButton
              flaggingOptions={flaggingOptions}
              firstName={entryData.firstName}
              isAnon={entryData.anonimity}
              alias={entryData.alias}
              flaggedCount={entryData.flagCount}
              userID={user.userID}
              entryID={entryData.entryID}
              entry={entryData.userID}
              fromAdmin={entryData.isAdmin}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DiaryEntryLayout;
