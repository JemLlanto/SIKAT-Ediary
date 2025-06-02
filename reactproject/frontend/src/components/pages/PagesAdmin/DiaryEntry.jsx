import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AnonymousIcon from "../../../assets/anonymous.png";
import MainLayout from "../../Layouts/MainLayout";
import CommentDropdown from "../../Layouts/CommentSection/CommentDropdown";
import DiaryEntryLayout from "../../Layouts/Home/DiaryEntryLayout";
import axios from "axios";

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

  // Fetch user data and check if logged in
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate("/");
    }
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
        `http://localhost:8081/fetchDiaryEntry/${entryID}`
      );
      const gadifyStatusResponse = await axios.get(
        `http://localhost:8081/gadifyStatus/${user.userID}`
      );

      if (response.data && response.data.entry) {
        const entry = response.data.entry;
        const isGadified = gadifyStatusResponse.data.some(
          (g) => g.entryID === entry.entryID
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
        `http://localhost:8081/fetchComments/${entryID}`
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
        `http://localhost:8081/followedUsers/${userID}`
      );
      setFollowedUsers(response.data.map((user) => user.userID));
    } catch (error) {
      console.error("Error fetching followed users:", error);
    }
  };

  const handleGadify = async (entryID) => {
    if (!user) return;

    try {
      const response = await axios.post(
        `http://localhost:8081/entry/${entryID}/gadify`,
        {
          userID: user.userID,
        }
      );
      const isGadified =
        response.data.message === "Gadify action recorded successfully";

      setEntries((prevEntries) =>
        prevEntries.map((entry) =>
          entry.entryID === entryID
            ? {
                ...entry,
                gadifyCount: isGadified
                  ? entry.gadifyCount + 1
                  : entry.gadifyCount - 1,
                isGadified,
              }
            : entry
        )
      );
    } catch (error) {
      console.error("Error updating gadify count:", error);
    }
  };

  const handleClick = (entryID) => {
    setEntries((prevEntries) =>
      prevEntries.map((entry) =>
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

  const handleFollowToggle = (userID) => {
    setFollowedUsers((prevFollowedUsers) =>
      prevFollowedUsers.includes(userID)
        ? prevFollowedUsers.filter((id) => id !== userID)
        : [...prevFollowedUsers, userID]
    );
  };

  return (
    <MainLayout>
      <div
        className="d-flex align-items-center justify-content-center pb-3"
        style={{ minHeight: "70vh" }}
      >
        {isLoading ? (
          <p>Loading...</p>
        ) : entries.length === 0 ? (
          <p>{error || "No entries available."}</p>
        ) : (
          entries.map((entry) => (
            <div
              className="d-flex justify-content-center align-items-center mt-3"
              style={{ width: "clamp(30rem, 60vw, 50rem)" }}
            >
              <DiaryEntryLayout
                className="w-100"
                key={entry.entryID}
                entry={entry}
                user={user}
                followedUsers={followedUsers}
                handleFollowToggle={handleFollowToggle}
                handleClick={handleClick}
                expandButtons={expandButtons}
                formatDate={formatDate}
              />
            </div>
          ))
        )}
      </div>
    </MainLayout>
  );
};

export default DiaryEntry;
