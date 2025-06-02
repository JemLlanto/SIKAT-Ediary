import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";

export const HandleFollowToggle = () => {
    const [modal, setModal] = useState({
        show: false,
        Message: "",
        onClose: () => {},
      });
      const [confirmModal, setConfirmModal] = useState({
        show: false,
        message: "",
        onConfirm: () => {},
        onCancel: () => {},
      });
  
      const showModal = () => {
        setModal({ show: true, message, onClose });
      };
      const closeModal = () => {
        setModal({ show: false, message: "", onClose: () => {} });
      };
  
      const showConfirmModal = (message, onConfirm, onCancel) => {
        setConfirmModal({ show: true, message, onConfirm, onCancel });
      };
      const closeConfirmModal = (isConfirmed) => {
        if (isConfirmed && confirmModal.onConfirm) confirmModal.onConfirm();
        if (!isConfirmed && confirmModal.onCancel) confirmModal.onCancel();
        setConfirmModal({
          show: false,
          message: "",
          onConfirm: () => {},
          onCancel: () => {},
        });
      };
  
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
          showConfirmModal(
            `Are you sure you want to unfollow ${targetUsername}?`,
            async () => {
              await axios.delete(
                `https://sikat-react-js-client.vercel.app/unfollow/${followUserId}`,
                {
                  data: { followerId: user.userID },
                }
              );
  
              setFollowedUsers((prev) =>
                prev.filter((u) => u.userID !== followUserId)
              );
              showModal(`You have unfollowed ${targetUsername}`, () => {});
            },
            () => {}
          );
        } else {
          const response = await axios.post(
            `https://sikat-react-js-client.vercel.app/follow/${followUserId}`,
            {
              followerId: user.userID,
            }
          );
          setFollowedUsers((prev) => [...prev, response.data]);
          showModal(`You are now following ${targetUsername}.`, () => {});
        }
      } catch (error) {
        console.error("Error toggling follow status:", error);
        showModal(`There was an error processing your request.`, () => {});
      }
  return (
    <div>HandleFollowToggle</div>
  )
}
