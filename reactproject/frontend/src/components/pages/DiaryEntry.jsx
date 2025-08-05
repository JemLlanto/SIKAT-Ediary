import React, { useState, useRef, useEffect } from "react";
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";

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
import DiaryEntryLayout from "../Layouts/Home/DiaryEntryLayout";
// import DiaryOwnerDetails from "../Layouts/DiaryEntry/DiaryOwnerDetails";

const DiaryEntry = () => {
  const { user } = useOutletContext();
  const { entryID } = useParams();
  const [entry, setEntry] = useState({});
  const [comments, setComments] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [expandButtons, setExpandButtons] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const commentSectionRef = useRef(null);
  const [flaggingOptions, setFlaggingOptions] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [navigate, user]);

  // FETCHING FLAGGING OPTIONS
  useEffect(() => {
    const fetchFlaggingOptions = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/flaggingOptions`
        );
        // console.log("flagging options", response.data);
        setFlaggingOptions(response.data);
      } catch (error) {
        console.error("Error fetching flagging options:", error);
      }
    };
    fetchFlaggingOptions();
  }, []);

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
        }/entries/fetchDiaryEntry/${entryID}`
      );
      const gadifyStatusResponse = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/gadifyStatus/${
          user.userID
        }`
      );
      if (response.data && response.data.entry) {
        const entry = response.data.entry;
        const isGadified = gadifyStatusResponse.data.some(
          (g) => g.entryID === entry.entryID
        );
        console.log("Entry data: ", entry);
        console.log("Is gadified: ", isGadified);

        const finalEntry = { ...entry, isGadified };
        console.log("Final entry: ", finalEntry);

        setEntry({ ...entry, isGadified });
      } else {
        setError("No entry found.");
      }
    } catch (error) {
      console.error("Error fetching entry:", error);
      setError("Error loading entry.");
      setEntry(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/fetchComments/${entryID}`
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
        }/follow/fetchFollowedUsers/${userID}`
      );
      const followedUsersData = response.data.map((user) => user.userID);
      setFollowedUsers(followedUsersData);
    } catch (error) {
      console.error("Error fetching followed users:", error);
    }
  };

  const handleGadify = async (entryID) => {
    if (!user) return;

    const entry = entry.find((entry) => entry.entryID === entryID);
    if (!entry) return;

    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/entry/${entryID}/gadify`,
        {
          userID: user.userID,
        }
      )
      .then((res) => {
        const isGadified =
          res.data.message === "Gadify action recorded successfully";

        setEntry((prevEntry) =>
          prevEntry.map((entry) =>
            entry.entryID === entryID
              ? {
                  ...entry,
                  gadifyCount: isGadified
                    ? entry.gadifyCount + 1
                    : entry.gadifyCount - 1,
                }
              : entry
          )
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
              }
            )
            .then((res) => {
              console.log("Notification response:", res.data);
            })
            .catch((err) => {
              console.error("Error sending gadify notification:", err);
            });
        }
      })
      .catch((err) => console.error("Error updating gadify count:", err));
  };

  const handleClick = (entryID) => {
    setEntry((prevEntry) =>
      prevEntry.map((entry) =>
        entry.entryID === entryID
          ? { ...entry, isGadified: !entry.isGadified }
          : entry
      )
    );
    setExpandButtons((prev) => ({ ...prev, [entryID]: true }));
    setTimeout(
      () => setExpandButtons((prev) => ({ ...prev, [entryID]: false })),
      300
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

  return (
    <div className="pt-4 pt-lg-0 d-flex align-items-center justify-content-center">
      <div
        className="d-flex justify-content-center align-items-center mt-4 mb-3 mt-lg-0 rounded"
        style={{ width: "50rem", minHeight: "30rem" }}
      >
        {isLoading ? (
          <>
            <DiaryLoader />
          </>
        ) : entry ? (
          <>
            <DiaryEntryLayout
              flaggingOptions={flaggingOptions}
              entry={entry}
              user={user}
              followedUsers={followedUsers}
              suspended={entry.isSuspended}
              fetchFollowedUsers={fetchFollowedUsers}
              setFollowedUsers={setFollowedUsers}
            />
            {/* <DiaryLoader /> */}
          </>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "#555",
              fontSize: "1.2rem",
            }}
          >
            <i
              className="bx bx-error-circle"
              style={{
                fontSize: "3rem",
                color: "#ff5e57",
                marginBottom: "1rem",
              }}
            ></i>
            <p>
              <strong>Entry Not Found</strong>
            </p>
            <p>
              It might have been deleted or you may not have permission to view
              it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiaryEntry;
