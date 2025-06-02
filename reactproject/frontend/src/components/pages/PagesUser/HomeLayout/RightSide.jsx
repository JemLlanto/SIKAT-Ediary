import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import DefaultProfile from "../../../../../src/assets/userDefaultProfile.png";
import HomeDiaryDropdown from "../../../Layouts/LayoutUser/HomeDiaryDropdown";
import SampleImage from "../../../../assets/Background.jpg";
import MessageModal from "../../../Layouts/DiaryEntry/messageModal";
import MessageAlert from "../../../Layouts/DiaryEntry/messageAlert";

const UserList = ({ users, handleFollowToggle, isFollowing }) => (
  <div
    className="custom-scrollbar mt-2"
    style={{ height: "clamp(5rem, 12dvw, 25rem)", overflowY: "scroll" }}
  >
    {users.length === 0 ? (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100%" }}
      >
        <p className="m-0 text-secondary">No followers</p>
      </div>
    ) : (
      users.map((user) => (
        <div key={user.userID} className=" pe-1">
          <div className="w-100 d-flex align-items-center justify-content-between gap-2">
            <div>
              <Link
                to={`/Profile/${user.userID}`}
                className=" position-relative rounded d-flex w-100 p-2 text-decoration-none text-secondary d-flex align-items-center"
              >
                <div className="">
                  <div className="profilePicture">
                    <img
                      src={
                        user.profile_image
                          ? `http://localhost:8081${user.profile_image}`
                          : DefaultProfile
                      }
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </div>
                <div className=" ps-0 ps-xl-2">
                  <div className="overflow-hidden followerName" style={{}}>
                    <p className="m-0 text-start text-nowrap">
                      {user.isAdmin === 1
                        ? "Gender and Development"
                        : user.firstName}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
            <button
              className="secondaryButton"
              onClick={() => handleFollowToggle(user.userID, user.firstName)}
              style={{ right: "2.5rem" }}
            >
              <p className="m-0">
                {isFollowing(user.userID) ? "Unfollow" : "Follow"}
              </p>
            </button>
          </div>
        </div>
      ))
    )}
  </div>
);

const RightSide = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);
  const navigate = useNavigate();

  // FOR MODALS
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

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchFollowers(parsedUser.userID);
      fetchUsers();
      fetchFollowedUsers(parsedUser.userID);
      fetchLatestAnnouncement(); // Fetch the latest announcement
    } else {
      navigate("/");
    }
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8081/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchFollowers = async (userID) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/followers/${userID}`
      );
      setFollowers(response.data);
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };

  const fetchFollowedUsers = async (userID) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/followedUsers/${userID}`
      );
      setFollowedUsers(response.data);
      localStorage.setItem("followedUsers", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching followed users:", error);
    }
  };

  const fetchLatestAnnouncement = async () => {
    try {
      const response = await axios.get("http://localhost:8081/announcement");
      setLatestAnnouncement(response.data);
    } catch (error) {
      console.error("Error fetching latest announcement:", error);
    }
  };

  const handleFollowToggle = async (followUserId, targetUsername) => {
    if (!followUserId) {
      console.error("User ID to follow/unfollow is undefined");
      return;
    }

    if (user.userID === followUserId) {
      alert("You cannot follow yourself.");
      return;
    }

    const isFollowing = followedUsers.some((f) => f.userID === followUserId);

    try {
      if (isFollowing) {
        setConfirmModal({
          show: true,
          message: `Are you sure you want to unfollow ${targetUsername}?`,
          onConfirm: async () => {
            await axios.delete(
              `http://localhost:8081/unfollow/${followUserId}`,
              {
                data: { followerId: user.userID },
              }
            );

            setFollowedUsers((prev) =>
              prev.filter((u) => u.userID !== followUserId)
            );
            setConfirmModal({ show: false, message: "" });
            setModal({
              show: true,
              message: `You have unfollowed ${targetUsername}.`,
            });
          },
          onCancel: () => {},
        });
      } else {
        const response = await axios.post(
          `http://localhost:8081/follow/${followUserId}`,
          {
            followerId: user.userID,
          }
        );
        setFollowedUsers((prev) => [...prev, response.data]);

        setModal({
          show: true,
          message: `You are now following ${targetUsername}.`,
        });
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
      setModal({
        show: true,
        message: `There was an error processing your request.`,
      });
    }
  };

  if (!user) return null;

  return (
    <>
      <></>
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

      <div className="p-2 " style={{ height: "87vh" }}>
        <div className="text-end" style={{ fontSize: "15px", color: "gray" }}>
          <p className="m-0 mb-1">
            Are you or someone you know experiencing gender-based violence?
          </p>
          <Link to={`/GetHelp/${user.userID}`}>
            <button className="secondaryButton text-decoration-underline">
              Report an Incident
            </button>
          </Link>
        </div>

        <div className="rounded mb-2 mt-3">
          <div className="d-flex align-items-center justify-content-between gap-1 border-top border-secondary-subtle text-secondary pt-2">
            <div className="d-flex align-items-center gap-1">
              <i className="bx bx-group bx-sm"></i>
              <h5 className="m-0">Followers</h5>
            </div>
            <Link to="/Followers" className="linkText rounded p-1">
              <p className="m-0">View All</p>
            </Link>
          </div>

          <UserList
            users={followers}
            handleFollowToggle={handleFollowToggle}
            isFollowing={(id) => followedUsers.some((f) => f.userID === id)}
          />
        </div>
        <div>
          <div className="d-flex align-items-center justify-content-start gap-1 border-top border-secondary-subtle text-secondary pt-2 mb-2">
            <i className="bx bx-news bx-sm"></i>
            <h5 className="m-0">Announcements/Events</h5>
          </div>

          {latestAnnouncement ? (
            <div
              className="overflow-y-scroll custom-scrollbar rounded pe-1"
              style={{ height: "clamp(5rem, 17dvw, 30rem)" }}
            >
              <Link
                to={`/DiaryEntry/${latestAnnouncement.entryID}`}
                className="linkText rounded p-0"
              >
                <p className="m-0 mb-1 text-start">
                  {latestAnnouncement.title || "Untitled Announcement"}
                </p>
                {latestAnnouncement.diary_image && (
                  <img
                    src={`http://localhost:8081${latestAnnouncement.diary_image}`}
                    alt="Announcement"
                    style={{ width: "100%", borderRadius: ".3rem" }}
                  />
                )}
              </Link>
            </div>
          ) : (
            <p className="text-secondary">No announcements available.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default RightSide;
