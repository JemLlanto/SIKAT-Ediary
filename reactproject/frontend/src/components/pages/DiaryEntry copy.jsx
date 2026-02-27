import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

// import Modal from "react-bootstrap/Modal";
// import CloseButton from "react-bootstrap/CloseButton";
// import CommentDropdown from "../Layouts/CommentSection/CommentDropdown";
// import DiaryEntryLayout from "../Layouts/Home/DiaryEntryLayout";
import CommentSection from "../Layouts/CommentSection/CommentSection";
import axios from "axios";
import FlagButton from "../Layouts/Home/FlagButton";
import ChatButton from "../Layouts/DiaryEntry/ChatButton";
import DiaryDetails from "../Layouts/DiaryEntry/DiaryDetails";
import ImageModal from "../Layouts/DiaryEntry/imageModal";
import FollowButton from "../Layouts/DiaryEntry/FollowButton";
import MessageModal from "../Layouts/DiaryEntry/messageModal";
import MessageAlert from "../Layouts/DiaryEntry/messageAlert";
import BackButton from "../Layouts/Home/BackButton";
import DiaryEntryHeader from "../Layouts/DiaryEntry/DiaryEntryHeader";
import DiaryLoader from "../loaders/DiaryLoader";
// import DiaryOwnerDetails from "../Layouts/DiaryEntry/DiaryOwnerDetails";

const DiaryEntry = () => {
  const { entryID } = useParams();
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [comments, setComments] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [expandButtons, setExpandButtons] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const commentSectionRef = useRef(null);
  const [flaggingOptions, setFlaggingOptions] = useState([]);

  // FOR MESSAGE MODALS
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

  // FOR CLICKABLE IMAGE
  const [showModal, setShowModal] = useState(false);
  const handleShowModal = (entryID) => {
    setShowModal(true);
    // updateEngagement(entryID);
  };
  const handleCloseModal = () => setShowModal(false);

  // Fetch user data and check if logged in
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate("/");
    }
  }, [navigate]);

  // FETCHING FLAGGING OPTIONS
  useEffect(() => {
    const fetchFlaggingOptions = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/flaggingOptions`,
        );
        // console.log("flagging options", response.data);
        setFlaggingOptions(response.data);
      } catch (error) {
        console.error("Error fetching flagging options:", error);
      }
    };
    fetchFlaggingOptions();
  }, []);

  // Fetch the data of the current user
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/");
      return;
    }
    setCurrentUser(storedUser);
  }, [navigate]);

  // Fetch entry and comments when user or entryID changes
  useEffect(() => {
    if (user && entryID) {
      fetchEntry();
      fetchComments();
      fetchFollowedUsers(user.userID);
    }
  }, [user, entryID]);

  const fetchEntry = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/entries/fetchDiaryEntry/${entryID}`,
      );
      const gadifyStatusResponse = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/gadifyStatus/${
          user.userID
        }`,
      );

      if (response.data && response.data.entry) {
        const entry = response.data.entry;
        const isGadified = gadifyStatusResponse.data.some(
          (g) => g.entryID === entry.entryID,
        );
        setEntries([{ ...entry, isGadified }]);
      } else {
        setError("No entry found.");
      }
    } catch (error) {
      console.error("Error fetching entry:", error);
      setError("Error loading entry.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/fetchComments/${entryID}`,
      );
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Failed to load comments.");
    }
  };

  const fetchFollowedUsers = async (userID) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/follow/fetchFollowedUsers/${userID}`,
      );
      const followedUsersData = response.data.map((user) => user.userID);
      setFollowedUsers(followedUsersData);
    } catch (error) {
      console.error("Error fetching followed users:", error);
    }
  };

  const handleGadify = async (entryID) => {
    if (!user) return;

    const entry = entries.find((entry) => entry.entryID === entryID);
    if (!entry) return;

    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/entry/${entryID}/gadify`,
        {
          userID: user.userID,
        },
      )
      .then((res) => {
        const isGadified =
          res.data.message === "Gadify action recorded successfully";

        setEntries((prevEntries) =>
          prevEntries.map((entry) =>
            entry.entryID === entryID
              ? {
                  ...entry,
                  gadifyCount: isGadified
                    ? entry.gadifyCount + 1
                    : entry.gadifyCount - 1,
                }
              : entry,
          ),
        );

        if (isGadified && user.userID !== entry.userID) {
          axios
            .post(
              `${
                import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
              }/notifications/${entry.userID}`,
              {
                actorID: user.userID,
                entryID: entryID,
                profile_image: user.profile_image,
                type: "gadify",
                message: `${user.firstName} ${user.lastName} gadified your diary entry.`,
              },
            )
            .then((res) => {
              // console.log("Notification response:", res.data);
            })
            .catch((err) => {
              console.error("Error sending gadify notification:", err);
            });
        }
      })
      .catch((err) => console.error("Error updating gadify count:", err));
  };

  const handleClick = (entryID) => {
    setEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.entryID === entryID
          ? { ...entry, isGadified: !entry.isGadified }
          : entry,
      ),
    );
    setExpandButtons((prev) => ({ ...prev, [entryID]: true }));
    setTimeout(
      () => setExpandButtons((prev) => ({ ...prev, [entryID]: false })),
      300,
    );
    handleGadify(entryID);
  };

  const formatDate = (dateString) => {
    const entryDate = new Date(dateString);
    const now = new Date();
    const timeDiff = now - entryDate;

    return timeDiff < 24 * 60 * 60 * 1000
      ? entryDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : entryDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
  };

  // FOR FLAGGED AND COMMENT COUNT
  const commentCount = comments.length;

  const [flaggedCount, setFlaggedCount] = useState(null);

  useEffect(() => {
    if (entries.length > 0) {
      const entry = entries[0]; // Assuming there's only one entry per page
      const fetchFlaggedCount = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/flaggedCount/${
              entry.entryID
            }`,
          );
          setFlaggedCount(response.data.flaggedCount);
        } catch (error) {
          console.error("Error fetching flagged count:", error);
        }
      };
      fetchFlaggedCount();
    }
  }, [entries]);

  const handleFollowToggle = async (followUserId, targetUsername) => {
    if (!followUserId) {
      console.error("User ID to follow/unfollow is undefined");
      return;
    }

    if (user.userID === followUserId) {
      alert("You cannot follow yourself.");
      return;
    }

    const isFollowing = followedUsers.includes(followUserId);

    try {
      if (isFollowing) {
        setConfirmModal({
          show: true,
          message: `Are you sure you want to unfollow ${targetUsername}?`,
          onConfirm: async () => {
            try {
              await axios.delete(
                `${
                  import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
                }/unfollow/${followUserId}`,
                {
                  data: { followerId: user.userID },
                },
              );

              // Update followed users list after unfollowing
              setFollowedUsers((prev) =>
                prev.filter((id) => id !== followUserId),
              );

              // Close confirmation modal and show success modal
              setConfirmModal({ show: false, message: "" });
              setModal({
                show: true,
                message: `You have unfollowed ${targetUsername}.`,
              });

              // Refresh the followed users list from the backend
              await fetchFollowedUsers(user.userID);
            } catch (error) {
              console.error("Error unfollowing user:", error);
              setModal({
                show: true,
                message: `There was an error unfollowing ${targetUsername}.`,
              });
            }
          },
          onCancel: () => setConfirmModal({ show: false, message: "" }),
        });
      } else {
        await axios.post(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/follow/${followUserId}`,
          {
            followerId: user.userID,
          },
        );

        // Update followed users list after following
        setFollowedUsers((prev) => [...prev, followUserId]);

        // Show success modal
        setModal({
          show: true,
          message: `You are now following ${targetUsername}.`,
        });

        // Send follow notification to the followed user
        await axios.post(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/notifications/${followUserId}`,
          {
            userID: followUserId,
            actorID: user.userID,
            entryID: null,
            profile_image: user.profile_image,
            type: "follow",
            message: `${user.firstName} ${user.lastName} has followed you.`,
          },
        );

        // Refresh the followed users list from the backend
        await fetchFollowedUsers(user.userID);
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
      setModal({
        show: true,
        message: `There was an error processing your request.`,
      });
    }
  };

  // FOR COMMENT BUTTON
  const commentButtonInput = useRef(null);
  const focusCommentInput = () => {
    commentButtonInput.current?.focusCommentInput();
  };

  return (
    <div className="pt-4 pt-lg-0">
      <MessageAlert
        showModal={modal}
        closeModal={closeModal}
        title={"Notice"}
        message={modal.message}
      ></MessageAlert>
      <MessageModal
        showModal={confirmModal}
        closeModal={closeConfirmModal}
        title={"Confirmation"}
        message={confirmModal.message}
        confirm={confirmModal.onConfirm}
        needConfirm={1}
      ></MessageModal>
      <div
        className="d-flex align-items-center justify-content-center pb-3 "
        style={{ minHeight: "70vh" }}
      >
        <BackButton></BackButton>
        {isLoading ? (
          <>
            <div
              className="row d-flex justify-content-center gap-3 mt-3 mt-md-0"
              style={{
                width: "clamp(19rem, 85dvw, 40rem)",
                height: "clamp(19rem, 85dvw, 30rem)",
              }}
            >
              <DiaryLoader />
            </div>
          </>
        ) : entries.length === 0 ? (
          <p>{error || "No entries available."}</p>
        ) : (
          entries.map((entry) => {
            const ownDiary = currentUser?.userID === entry.userID;
            return (
              <div
                className="d-flex justify-content-center align-items-center mt-3 mt-lg-0 bg-light rounded shadow-sm p-3"
                style={{ width: "" }}
              >
                <div
                  className="row d-flex justify-content-center gap-3"
                  style={{
                    width: entry.diary_image
                      ? "clamp(19rem, 80dvw, 90rem)"
                      : "clamp(19rem, 85dvw, 40rem)",
                  }}
                >
                  {entry.diary_image && (
                    // IMAGE SIDE
                    <div className="col-xl-7 d-flex justify-content-center align-items-center overflow-hidden rounded">
                      <div
                        style={{
                          width: "clamp(19rem, 90dvw, 90rem)",
                          height: "clamp(19rem, 80dvw, 80dvh)",
                        }}
                      >
                        <img
                          className="DiaryImage rounded"
                          src={entry.diary_image}
                          alt="Diary"
                          style={{
                            cursor: "pointer",
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }} // Add pointer cursor
                          onClick={() => handleShowModal(entry.entryID)} // Open modal on click
                        />
                      </div>
                      {/* Clickable Image */}
                      {entry.diary_image && (
                        <>
                          {/* Modal */}
                          <ImageModal
                            showModal={showModal}
                            handleCloseModal={handleCloseModal}
                            diaryImage={entry.diary_image}
                          ></ImageModal>
                        </>
                      )}
                    </div>
                  )}

                  {/* DIARY DETAILS SIDE */}
                  <div
                    className="col-xl col-md"
                    style={
                      {
                        // width: entry.diary_image
                        //   ? "clamp(19rem, 30dvw, 30rem)"
                        //   : "clamp(19rem, 50dvw, 50rem)",
                        // height: "clamp(19rem, 50dvw, 80dvh)",
                      }
                    }
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

                    {/* DIARY ENTRY DETAILS */}
                    <div
                      className="text-start border-bottom py-2 pt-2 overflow-y-scroll custom-scrollbar"
                      style={{ height: "18dvh" }}
                    >
                      <DiaryDetails user={user} entry={entry}></DiaryDetails>
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

                      <div className="col p-0">
                        <CommentSection
                          user={user}
                          entryData={entry}
                          commentCount={comments.length}
                          userID={currentUser?.userID}
                          entryID={entry.entryID}
                          entry={entry.userID}
                          firstName={entry.firstName}
                          isAnon={entry.anonimity}
                          alias={entry.alias}
                        />
                        {/* {entry.isFlagged} */}
                      </div>
                      <div className="col p-0">
                        {currentUser.isAdmin ? (
                          <ChatButton
                            entry={entry}
                            user={user}
                            imageFile={`${
                              import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
                            }${entry.profile_image}`}
                            userToChat={entry.userID}
                          ></ChatButton>
                        ) : (
                          <FlagButton
                            flaggingOptions={flaggingOptions}
                            firstName={entry.firstName}
                            isAnon={entry.anonimity}
                            alias={entry.alias}
                            flaggedCount={entry.flagCount}
                            userID={user.userID}
                            entryID={entry.entryID}
                            entry={entry.userID}
                            fromAdmin={entry.isAdmin}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DiaryEntry;
