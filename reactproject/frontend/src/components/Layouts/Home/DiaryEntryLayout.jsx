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
  handleFollowToggle,
  formatDate,
  flaggingOptions,
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
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/");
      return;
    }
    setCurrentUser(storedUser);
  }, [navigate]);

  // useEffect(() => {
  //   if (user) {
  //     fetchEntries(user.userID, filters);
  //   }
  // }, [user, filters]);

  useEffect(() => {
    if (entryData.entryID) {
      const fetchComments = async () => {
        try {
          const response = await axios.get(
            `  ${
              import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
            }/fetchComments/${entryData.entryID}`
          );
          setComments(response.data);
        } catch (error) {
          console.error("Error fetching comments:", error);
        }
      };
      fetchComments();
    }
  }, [entryData.entryID]);

  useEffect(() => {
    if (entryData.entryID) {
      const fetchComments = async () => {
        try {
          const response = await axios.get(
            `  ${
              import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
            }/fetchComments/${entryData.entryID}`
          );
          setComments(response.data);
        } catch (error) {
          console.error("Error fetching comments:", error);
        }
      };
      fetchComments();
    }
  }, [entryData.entryID]);

  // const fetchEntries = async (userID, filters) => {
  //   try {
  //     // console.log("Fetching single entry...");
  //     setLoading(true);
  //     const response = await axios.get(
  //       `${
  //         import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
  //       }/entries/fetchEntries`,
  //       {
  //         params: { userID, filters },
  //       }
  //     );

  //     const gadifyStatusResponse = await axios.get(
  //       `${
  //         import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
  //       }/gadifyStatus/${userID}`
  //     );

  //     const updatedEntries = response.data.map((entry) => {
  //       const isGadified = gadifyStatusResponse.data.some(
  //         (g) => g.entryID === entryData.entryID
  //       );
  //       return { ...entry, isGadified };
  //     });
  //     console.log("ENTRY FETCHED IN DIARY LAYOUT: ", updatedEntries);
  //     setEntries(updatedEntries);
  //   } catch (error) {
  //     console.error("Error fetching diary entries:", error);
  //   } finally {
  //     // console.log("Entry fetched");
  //     setLoading(false);
  //   }
  // };

  // const handleDeleteEntry = async (entryID) => {
  //   const confirmed = window.confirm(
  //     "Are you sure you want to delete this entry?"
  //   );
  //   if (confirmed) {
  //     try {
  //       await axios.delete(
  //         `${
  //           import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
  //         }/deleteEntry/${entryID}`
  //       );
  //       alert("Diary entry deleted successfully.");
  //       setEntries((prevEntries) =>
  //         prevEntries.filter((entry) => entryData.entryID !== entryID)
  //       );
  //     } catch (error) {
  //       console.error("Error deleting diary entry:", error);
  //       alert("Failed to delete the entry.");
  //     }
  //   }
  // };

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
        handleFollowToggle={handleFollowToggle}
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

        {/* <div className="row pt-2">
          <div className="col">
            <i className="bx bx-comment"></i>
            {comments.length}
          </div> */}

        <div className="col p-0">
          <CommentSection
            commentCount={comments.length}
            userID={currentUser?.userID}
            entryID={entryData.entryID}
            entry={entryData.userID}
            firstName={entryData.firstName}
            isAnon={entryData.anonimity}
            alias={entryData.alias}
          />
          {/* {entry.isFlagged} */}
        </div>

        <div className="col p-0">
          {user.isAdmin ? (
            <ChatButton
              user={user}
              entry={entry}
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
