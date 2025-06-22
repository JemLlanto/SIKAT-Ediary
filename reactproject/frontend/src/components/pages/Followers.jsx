import React, { useState, useEffect } from "react";
import axios from "axios";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import DefaultProfile from "../../assets/userDefaultProfile.png";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import MessageModal from "../Layouts/DiaryEntry/messageModal";
import MessageAlert from "../Layouts/DiaryEntry/messageAlert";
import { Spinner } from "react-bootstrap";

const UserList = ({
  isLoading,
  type,
  users,
  handleFollowToggle,
  isFollowing,
}) => (
  <div
    className="custom-scrollbar mt-2 pe-1"
    style={{ height: "70vh", overflowY: "scroll" }}
  >
    {isLoading ? (
      <>
        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ height: "80%" }}
        >
          <Spinner variant="secondary" animation="border" size="sm" />
          <p className="m-0 text-secondary">Loading {type}</p>
        </div>
      </>
    ) : (
      <>
        {users.length === 0 ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "80%" }}
          >
            <p className="m-0 text-secondary">No {type}</p>
          </div>
        ) : (
          users.map((user) => (
            <div key={user.userID} className="pb-2 mb-2">
              <div className="position-relative d-flex align-items-center justify-content-between gap-2">
                <div className="linkText rounded d-flex justify-content-between w-100 p-0">
                  <div className="w-100 d-flex align-items-center justify-content-between">
                    <Link
                      to={`/Profile/${user.userID}`}
                      className="d-flex align-items-center gap-2 text-decoration-none text-dark"
                    >
                      <div className="profilePicture">
                        <img
                          src={user.profile_image}
                          alt="Profile"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      <p className="m-0 text-start w-75">
                        {user.firstName} {user.lastName}
                      </p>
                    </Link>

                    <button
                      className="primaryButton"
                      onClick={(e) => {
                        e.stopPropagation(),
                          handleFollowToggle(user.userID, user.firstName);
                      }}
                      style={{ right: "0" }}
                    >
                      <p className="m-0">
                        {isFollowing(user.userID) ? "Unfollow" : "Follow"}
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </>
    )}
  </div>
);

const Followers = () => {
  const { user } = useOutletContext();
  const [followers, setFollowers] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
      // setIsLoading(false);
    } else {
      navigate("/");
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchFollowers(user?.userID);
    fetchFollowedUsers(user?.userID);
  }, [user]);

  const fetchFollowers = async (userID) => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/follow/fetchFollowers/${userID}`
      );
      setFollowers(response.data);
      console.log("Fetched followers: ", response.data);
    } catch (error) {
      console.error("Error fetching followers:", error);
    } finally {
      // setIsLoading(false);
    }
  };

  const fetchFollowedUsers = async (userID) => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/follow/fetchFollowedUsers/${userID}`
      );
      if (response.status === 200) {
        if (response.data.length === 0) {
          console.log("No followed users found.");
        } else {
          const followedUsersData = response.data;
          setFollowedUsers(followedUsersData);
          console.log("Fetched followed users: ", response.data);
          localStorage.setItem(
            "followedUsers",
            JSON.stringify(followedUsersData)
          );
        }
      }
    } catch (error) {
      console.error("Error fetching followed users:", error);
    } finally {
      setIsLoading(false);
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
            try {
              await axios.delete(
                `${
                  import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
                }/unfollow/${followUserId}`,
                {
                  data: { followerId: user.userID },
                }
              );

              // Update followed users list after unfollowing
              setFollowedUsers((prev) =>
                prev.filter((id) => id !== followUserId)
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
        const response = await axios.post(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/follow/${followUserId}`,
          {
            followerId: user.userID,
          }
        );
        const followedUserData = response.data;

        setFollowedUsers((prev) => [...prev, followedUserData]);
        setModal({
          show: true,
          message: `You are now following ${targetUsername}.`,
        });
        // alert("You are now following the user.");
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
      setModal({
        show: true,
        message: `There was an error processing your request..`,
      });
    }
  };

  if (!user) return null;

  return (
    <>
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

      <div className="pt-4 pt-lg-0">
        <div
          className="container rounded p-3 shadow-sm mt-4 mt-lg-0"
          style={{
            width: "clamp(19rem, 65dvw, 40rem)",
            height: "clamp(30rem, 65dvw, 39rem)",
            backgroundColor: "#ffff",
          }}
        >
          <Tabs
            defaultActiveKey="Followers"
            id="uncontrolled-tab-example"
            className="mb-3"
          >
            <Tab eventKey="Followers" title="Followers">
              <div>
                <UserList
                  isLoading={isLoading}
                  type={"Followers"}
                  users={followers}
                  handleFollowToggle={handleFollowToggle}
                  isFollowing={(id) =>
                    followedUsers.some((f) => f.userID === id)
                  }
                />
              </div>
            </Tab>
            <Tab eventKey="Following" title="Following">
              <div>
                <UserList
                  isLoading={isLoading}
                  type={"Following"}
                  users={followedUsers}
                  handleFollowToggle={handleFollowToggle}
                  isFollowing={() => true}
                />
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Followers;
