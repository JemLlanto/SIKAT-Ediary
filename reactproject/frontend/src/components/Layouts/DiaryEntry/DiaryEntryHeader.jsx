import React from "react";
import { Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import Suspend from "../Profile/Suspend";
import Hide from "../Profile/Hide";
import anonymous from "../../../assets/anonymous.png";
import EditDiaryEntryButton from "../Home/EditDiaryEntryButton";
import DeleteButton from "./DeleteButton";
import EditPostButton from "../Home/EditPostButton";
import Reviewed from "../Profile/Reviewed";

const DiaryEntryHeader = ({
  entry,
  user,
  formatDate,
  ownDiary,
  currentUser,
  FollowButton,
  followedUsers,
  handleFollowToggle,
}) => {
  return (
    <div className="border-bottom d-flex gap-2 pb-2">
      {/* IF PUBLIC */}
      <div className="d-flex align-items-center gap-2 text-secondary">
        {/* TO DETERMINE IF THE DIARY IN ANONYMOUS OR NOT */}
        {entry.anonimity === "private" ? (
          <div className="profilePicture">
            <img
              src={anonymous}
              alt="Profile"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        ) : (
          <Link
            to={`/Profile/${entry.userID}`}
            className="linkText rounded p-0"
          >
            <div className="profilePicture">
              <img
                src={`http://localhost:8081${entry.profile_image}`}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          </Link>
        )}
        <div className="d-flex flex-column align-items-start">
          <div className="d-flex align-items-center justify-content-center gap-1">
            {entry.anonimity === "private" ? (
              <h5 className="m-0">
                {entry.alias} {entry.userID === user.userID ? "(You)" : null}
                {user.isAdmin && !ownDiary ? `(${entry.course})` : null}
              </h5>
            ) : (
              <Link
                to={`/Profile/${entry.userID}`}
                className="linkText rounded p-0"
              >
                <h5 className="m-0 text-start">
                  {entry.isAdmin === 1
                    ? "Gender and Development"
                    : entry.firstName && entry.lastName
                    ? entry.firstName + " " + entry.lastName
                    : user.firstName + " " + user.lastName}{" "}
                  {user.isAdmin || !ownDiary ? (
                    <>{entry.isAdmin ? null : `(${entry.course})`}</>
                  ) : null}
                  <>
                    {entry.isAdmin === 1
                      ? `(Admin)`
                      : entry.isAdmin === 2
                      ? `(Moderator)`
                      : null}
                  </>
                </h5>
              </Link>
            )}
            {entry.isAdmin === 0 && user.isAdmin === 0 ? (
              <>
                {user &&
                  user.userID !== entry.userID &&
                  entry.anonimity !== "private" &&
                  entry.isAdmin !== 1 && (
                    <div className="d-flex align-items-center gap-1">
                      <h3
                        className="m-0 text-secondary d-flex align-items-center"
                        style={{ height: ".9rem" }}
                      >
                        ·
                      </h3>
                      <FollowButton
                        userID={entry.userID}
                        firstName={entry.firstName}
                        followedUsers={followedUsers}
                        handleFollowToggle={handleFollowToggle}
                      ></FollowButton>
                    </div>
                  )}
              </>
            ) : null}
          </div>
          <p className="m-0" style={{ fontSize: ".7rem" }}>
            {formatDate(entry.created_at)}{" "}
            <span>
              {entry.visibility === "public" ? (
                <i class="bx bx-globe"></i>
              ) : (
                <i class="bx bx-lock-alt"></i>
              )}
            </span>
          </p>
        </div>
      </div>
      <div>
        {ownDiary || (user.isAdmin && !entry.isAdmin && entry.isFlagged) ? (
          <Dropdown className="informationToolTip" style={{ zIndex: "1" }}>
            {entry.departmentID !== user.departmentID &&
              user.departmentID !== 8 && (
                <div className=" accordion text-danger align-middle">
                  <p
                    className="infToolTip rounded p-2 m-0 mt-1 text-center"
                    style={{
                      width: "20rem",
                    }}
                  >
                    You can only moderate students under {user.DepartmentName}.
                  </p>
                </div>
              )}

            <Dropdown.Toggle
              className="btn-light d-flex align-items-center pt-0 pb-2"
              id="dropdown-basic"
              bsPrefix="custom-toggle"
              disabled={
                entry.departmentID !== user.departmentID &&
                user.departmentID !== 8
              }
            >
              <h5 className="m-0">...</h5>
            </Dropdown.Toggle>
            <Dropdown.Menu className="p-2">
              {user.isAdmin && !entry.isAdmin ? (
                <>
                  {/* <Suspend
                    entryID={entry.entryID}
                    userID={entry.userID}
                    firstName={entry.firstName}
                    suspended={entry.isSuspended}
                  ></Suspend> */}

                  <Reviewed entry={entry} entryID={entry.entryID}></Reviewed>
                  <Hide
                    type={"diary"}
                    entry={entry}
                    entryID={entry.entryID}
                  ></Hide>
                </>
              ) : (
                <>
                  <Dropdown.Item className="p-0 btn btn-light">
                    {user.isAdmin ? (
                      <EditPostButton
                        entry={entry}
                        entryID={entry.entryID}
                        diaryTitle={entry.title}
                        diaryDesc={entry.description}
                        diaryVisib={entry.visibility}
                        diaryAnon={entry.anonimity}
                        diarySub={entry.subjects}
                        imageFile={
                          entry.diary_image &&
                          `http://localhost:8081${entry.diary_image}`
                        }
                      ></EditPostButton>
                    ) : (
                      <EditDiaryEntryButton
                        entry={entry}
                        entryID={entry.entryID}
                        diaryTitle={entry.title}
                        diaryDesc={entry.description}
                        diaryVisib={entry.visibility}
                        diaryAnon={entry.anonimity}
                        diarySub={entry.subjects}
                        imageFile={
                          entry.diary_image &&
                          `http://localhost:8081${entry.diary_image}`
                        }
                      />
                    )}
                  </Dropdown.Item>
                  <Dropdown.Item className="p-0 btn btn-light">
                    <DeleteButton
                      entryID={entry.entryID}
                      title={entry.title}
                    ></DeleteButton>
                  </Dropdown.Item>
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>
        ) : null}
      </div>
    </div>
  );
};

export default DiaryEntryHeader;
