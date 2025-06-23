import Dropdown from "react-bootstrap/Dropdown";
import ReportButton from "./ReportCommentButton";
import Suspend from "../Profile/Suspend";

const CommentDropdown = ({ comment, entryData, user }) => {
  const ownComment = comment.userID === user.userID;
  return (
    <Dropdown>
      <Dropdown.Toggle
        className="btn-light d-flex align-items-center pt-0 pb-2"
        id="dropdown-basic"
        bsPrefix="custom-toggle"
        disabled={comment.isAdmin}
      >
        <h5 className="m-0">...</h5>
      </Dropdown.Toggle>

      <Dropdown.Menu className="p-2 ">
        {ownComment ? (
          <>
            <Dropdown.Item className="p-0 btn btn-light ">
              <button
                className="btn btn-light w-100 d-flex align-items-center justify-content-center"
                onClick={() => handleEditComment(comment)}
              >
                <p className="m-0">Edit</p>
                <i className="bx bxs-edit m-0 ms-1"></i>
              </button>
            </Dropdown.Item>
            <Dropdown.Item className="p-0 btn btn-light ">
              <button
                className="btn btn-light w-100 d-flex align-items-center justify-content-center"
                onClick={() => handleDeleteComment(comment.commentID)}
              >
                <p className="m-0">Delete</p>
                <i className="bx bx-message-square-x m-0 ms-1"></i>
              </button>
            </Dropdown.Item>
          </>
        ) : user.isAdmin ? (
          <>
            <Suspend profileOwner={comment} />
            {/* <Hide type={"comment"} entry={entry} /> */}
          </>
        ) : (
          <Dropdown.Item className="p-0 btn btn-light">
            <ReportButton
              ownComment={ownComment}
              isAnon={entryData.anonimity}
              alias={entryData.alias}
              commentID={comment.commentID}
              userID={comment.userID}
              firstName={comment.firstName}
              entryID={entryData.entryID}
            />
          </Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default CommentDropdown;
