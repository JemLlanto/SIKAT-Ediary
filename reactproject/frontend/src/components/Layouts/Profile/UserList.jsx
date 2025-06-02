import React from "react";
import { Link } from "react-router-dom";

const UserList = ({
  ownProfile,
  currentUser,
  users,
  handleFollowToggle,
  isFollowing,
}) => (
  <div
    className="custom-scrollbar mt-2 pe-1"
    style={{ height: "70vh", overflowY: "scroll" }}
  >
    {users
      .filter((user) => user.isAdmin === 0)
      .map((user) => (
        <div key={user.userID} className="pb-2 pe-2 mb-2">
          <div className="position-relative d-flex align-items-center justify-content-between gap-2">
            <Link
              to={`/Profile/${user.userID}`}
              className="linkText rounded d-flex justify-content-between w-100 p-2"
            >
              <div className="d-flex align-items-center">
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
                <p className="m-0 ms-2">
                  {user.firstName} {user.lastName}
                </p>
              </div>
            </Link>
            {!ownProfile ? (
              <Link
                to={`/Profile/${user.userID}`}
                className="primaryButton position-absolute text-decoration-none"
                //   onClick={() => handleFollowToggle(user.userID, user.firstName)}
                style={{ right: "0" }}
              >
                <p className="m-0">Visit</p>
              </Link>
            ) : (
              <button
                className="primaryButton position-absolute"
                onClick={() => handleFollowToggle(user.userID, user.firstName)}
                style={{ right: "0" }}
              >
                <p className="m-0">
                  {isFollowing(user.userID) ? "Unfollow" : "Follow"}
                </p>
              </button>
            )}
          </div>
        </div>
      ))}
  </div>
);

export default UserList;
