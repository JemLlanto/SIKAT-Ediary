import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
Swal;

function HideComment({ comment, setIsHidden }) {
  const [show, setShow] = useState(false);

  const hideComment = async (commentID) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to hide this comment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, hide it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await axios.put(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/hideComment`,
          {
            commentID,
          }
        );

        Swal.fire({
          icon: "success",
          title: "Hidden Successfully",
          text: `Hide comment successfully.`,
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          // window.location.reload();
          setIsHidden(commentID);
        });
      } catch (error) {
        console.error("Error updating hide:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while hiding the comment.",
        });
      }
    }
  };

  return (
    <>
      <button
        className="btn btn-light w-100 d-flex align-items-center justify-content-center gap-1"
        disabled={comment.isHidden}
        onClick={() => hideComment(comment.commentID)}
        // disabled={suspended}
      >
        <i className="bx bxs-hide"></i>
        <p className="m-0">
          {comment.isHidden ? "This comment is hidden." : "Hide"}
        </p>
      </button>
    </>
  );
}

export default HideComment;
