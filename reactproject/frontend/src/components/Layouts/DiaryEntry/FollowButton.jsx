import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MessageModal from "./messageModal";

const FollowButton = ({
  userID,
  firstName,
  user,
  filters,
  followedUsers,
  handleFollowToggle,
}) => {
  return (
    <>
      <button
        className="secondaryButton p-0 m-0"
        onClick={() => handleFollowToggle(userID, firstName)}
      >
        <h5 className="m-0">
          {followedUsers.includes(userID) ? "Following" : "Follow"}
        </h5>
      </button>
    </>
  );
};

export default FollowButton;
