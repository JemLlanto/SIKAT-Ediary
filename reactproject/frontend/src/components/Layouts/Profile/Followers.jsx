import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import Tab from "react-bootstrap/Tab";
import axios from "axios";
import Tabs from "react-bootstrap/Tabs";
import { Link } from "react-router-dom";
import CloseButton from "react-bootstrap/CloseButton";
import DefaultProfile from "../../../assets/userDefaultProfile.png";
import { useNavigate } from "react-router-dom";
import MessageAlert from "../DiaryEntry/messageAlert";
import MessageModal from "../DiaryEntry/messageModal";
import { first } from "lodash";
import UserList from "./UserList";

const Followers = ({
  ownProfile,
  user,
  currentUser,
  followersCount,
  followingCount,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
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

  // useEffect(() => {
  //   const userData = localStorage.getItem("user");
  //   if (userData) {
  //     const parsedUser = JSON.parse(userData);
  //     setUser(parsedUser);
  //     fetchFollowers(parsedUser.userID);
  //     fetchFollowedUsers(parsedUser.userID);
  //   } else {
  //     navigate("/");
  //   }
  // }, [navigate]);

  useEffect(() => {
    fetchFollowers(user.userID);
    fetchFollowedUsers(user.userID);
    console.log("userID", user.userID);
  }, [user.userID]);

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
      const followedUsersData = response.data;
      setFollowedUsers(followedUsersData);
      localStorage.setItem("followedUsers", JSON.stringify(followedUsersData));
    } catch (error) {
      console.error("Error fetching followed users:", error);
    }
  };

  const handleFollowToggle = async (followUserId, firstName) => {
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
          message: `Are you sure you want to unfollow ${firstName}?`,
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
            closeConfirmModal();
            setModal({
              show: true,
              message: `You have unfollowed ${firstName}.`,
            });
          },
          onCancel: () => setConfirmModal({ show: false, message: "" }),
        });
      } else {
        const response = await axios.post(
          `http://localhost:8081/follow/${followUserId}`,
          {
            followerId: user.userID,
          }
        );
        const followedUserData = response.data;

        setFollowedUsers((prev) => [...prev, followedUserData]);
        setModal({
          show: true,
          message: `You are now following ${firstName}.`,
        });
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
      alert("There was an error processing your request.");
    }
  };

  const handleShow = () => setShowModal(true);
  const handleCLose = () => setShowModal(false);
  return (
    <div>
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
      <button className="border-0 bg-transparent p-0" onClick={handleShow}>
        <p className="m-0 mt-1 text-secondary underlinedLink">
          {followersCount} Followers - {followingCount} Following
        </p>
      </button>
      <Modal show={showModal} onHide={handleCLose} centered>
        <Modal.Body className="position-relative">
          <Tabs
            defaultActiveKey="Followers"
            id="uncontrolled-tab-example"
            className="mb-3"
          >
            <Tab eventKey="Followers" title="Followers">
              {/* <div>
                <UserList
                  users={followers}
                  handleFollowToggle={handleFollowToggle}
                  isFollowing={(id) =>
                    followedUsers.some((f) => f.userID === id)
                  }
                />
              </div> */}
              <UserList
                ownProfile={ownProfile}
                currentUser={currentUser}
                users={followers}
                handleFollowToggle={handleFollowToggle}
                isFollowing={(id) => followedUsers.some((f) => f.userID === id)}
              ></UserList>
            </Tab>
            <Tab eventKey="Following" title="Following">
              {/* <div>
                <UserList
                  users={followedUsers}
                  handleFollowToggle={handleFollowToggle}
                  isFollowing={() => true}
                />
              </div> */}
              <UserList
                ownProfile={ownProfile}
                currentUser={currentUser}
                users={followedUsers}
                handleFollowToggle={handleFollowToggle}
                isFollowing={() => true}
              ></UserList>
            </Tab>
          </Tabs>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Followers;
