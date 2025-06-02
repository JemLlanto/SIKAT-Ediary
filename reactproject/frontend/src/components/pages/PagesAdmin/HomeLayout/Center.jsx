import DiaryEntryButton from "../../../Layouts/Home/DiaryEntryButton";
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import anonymous from "../../../../assets/anonymous.png";
import axios from "axios";
import FilterButton from "../../../Layouts/LayoutUser/FilterButton";
import CommentSection from "../../../Layouts/CommentSection/CommentSection";
import HomeDiaryDropdown from "../../../Layouts/LayoutUser/HomeDiaryDropdown";
import CenterLoader from "../../../loaders/CenterLoader";
import userDefaultProfile from "../../../../assets/userDefaultProfile.png";
import TransparentLogo from "../../../../assets/TransparentLogo.png";
import ReportButton from "../../../Layouts/CommentSection/ReportCommentButton";
import Dropdown from "react-bootstrap/Dropdown";
import DiaryEntryLayout from "../../../Layouts/Home/DiaryEntryLayout";
import PostButton from "../../../Layouts/Home/PostButton";

const CenterAdmin = () => {
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(null);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [activeButtons, setActiveButtons] = useState({});
  const [expandButtons, setExpandButtons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    sexualHarassment: false,
    domesticAbuse: false,
    genderRelated: false,
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } else {
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchFollowedUsers(user.userID);
      fetchEntries(user.userID, filters);
    }
  }, [user, filters]);

  const fetchFollowedUsers = async (userID) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/followedUsers/${userID}`
      );
      const followedUsersData = response.data.map((user) => user.userID);
      setFollowedUsers(followedUsersData);
    } catch (error) {
      console.error("Error fetching followed users:", error);
    }
  };

  const fetchEntries = async (userID, filters) => {
    try {
      // console.log("Fetching entries for user:", userID);
      // console.log("Applied filters:", filters);

      const response = await axios.get("http://localhost:8081/entries", {
        params: { userID: userID, filters: filters }, // Now passing an array of filter strings
      });

      // console.log("Entries response:", response.data);

      const gadifyStatusResponse = await axios.get(
        `http://localhost:8081/gadifyStatus/${userID}`
      );

      // console.log("Gadify status response:", gadifyStatusResponse.data);

      const updatedEntries = response.data.map((entry) => {
        const isGadified = gadifyStatusResponse.data.some(
          (g) => g.entryID === entry.entryID
        );
        return { ...entry, isGadified };
      });

      setEntries(updatedEntries);
    } catch (error) {
      console.error("There was an error fetching the diary entries!", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (selectedFiltersArray) => {
    // Build an array of active filters as strings
    const activeFilters = [];

    if (selectedFiltersArray.includes("Sexual Harassment")) {
      activeFilters.push("Sexual Harassment");
    }

    if (selectedFiltersArray.includes("Domestic Abuse")) {
      activeFilters.push("Domestic Abuse");
    }

    if (selectedFiltersArray.includes("Gender Related")) {
      activeFilters.push("Gender Related");
    }

    setFilters(activeFilters);
  };

  const handleGadify = (entryID) => {
    if (!user) return;

    const entry = entries.find((entry) => entry.entryID === entryID);
    if (!entry) return;

    axios
      .post(`http://localhost:8081/entry/${entryID}/gadify`, {
        userID: user.userID,
      })
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
              : entry
          )
        );

        // Only send notification if gadified (count is incremented) and user is not the owner
        if (isGadified && user.userID !== entry.userID) {
          axios
            .post(`http://localhost:8081/notifications/${entry.userID}`, {
              actorID: user.userID,
              entryID: entryID,
              profile_image: user.profile_image,
              type: "gadify",
              message: `${user.username} gadified your diary entry.`,
            })
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

  const handleFollowToggle = async (followUserId) => {
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
        const confirmed = window.confirm(
          `Are you sure you want to unfollow this ${followUserId}?`
        );

        if (!confirmed) {
          return;
        }
        await axios.delete(`http://localhost:8081/unfollow/${followUserId}`, {
          data: { followerId: user.userID },
        });

        setFollowedUsers((prev) => prev.filter((id) => id !== followUserId));
        alert(`You have unfollowed user ${followUserId}`);
      } else {
        await axios.post(`http://localhost:8081/follow/${followUserId}`, {
          followerId: user.userID,
        });

        setFollowedUsers((prev) => [...prev, followUserId]);
        alert(`You are now following user ${followUserId}`);

        // Send follow notification
        await axios.post(
          `http://localhost:8081/notifications/${followUserId}`,
          {
            userID: followUserId, // Notify the user who was followed
            actorID: user.userID, // The user who performed the follow action
            entryID: null,
            type: "follow",
            message: `${user.username} has followed you.`,
          }
        );
      }

      await fetchFollowedUsers(user.userID);
    } catch (error) {
      console.error("Error toggling follow status:", error);
      alert("There was an error processing your request.");
    }
  };

  const handleClick = (entryID) => {
    // Toggle the isGadified state for the clicked entry
    setEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.entryID === entryID
          ? { ...entry, isGadified: !entry.isGadified }
          : entry
      )
    );

    // Trigger the expand animation
    const updatedExpandButtons = { ...expandButtons, [entryID]: true };
    setExpandButtons(updatedExpandButtons);

    // Remove the expand class after the animation completes
    setTimeout(() => {
      updatedExpandButtons[entryID] = false;
      setExpandButtons({ ...updatedExpandButtons });
    }, 300);

    // Perform the Gadify action
    handleGadify(entryID);
  };

  const formatDate = (dateString) => {
    const entryDate = new Date(dateString);
    const now = new Date();
    const timeDiff = now - entryDate;

    // Check if the time difference is less than 24 hours (in milliseconds)
    if (timeDiff < 24 * 60 * 60 * 1000) {
      // Return time formatted as "HH:MM AM/PM"
      return entryDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      // Return date formatted as "MMM D"
      return entryDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  if (isLoading) {
    return <CenterLoader></CenterLoader>;
  }

  if (!user) return null;

  return (
    <div className="overflow-hidden p-2">
      <div
        className="rounded shadow-sm p-3 my-1"
        style={{ backgroundColor: "white" }}
      >
        <PostButton onEntrySaved={() => fetchEntries(user.userID, filters)} />
      </div>
      {entries.length === 0 ? (
        <p>No entries available.</p>
      ) : (
        entries.map((entry) => (
          <DiaryEntryLayout
            key={entry.entryID}
            entry={entry}
            user={user}
            followedUsers={followedUsers}
            handleFollowToggle={handleFollowToggle}
            handleClick={handleClick}
            expandButtons={expandButtons}
            formatDate={formatDate}
          />
        ))
      )}
    </div>
  );
};

export default CenterAdmin;
