import axios from "axios";
import Swal from "sweetalert2";

const FollowButton = ({
  userID,
  firstName,
  user,
  followedUsers,
  fetchFollowedUsers,
  setFollowedUsers,
}) => {
  const handleFollowToggle = async (followUserId, targetUsername) => {
    if (!followUserId) {
      console.error("User ID to follow/unfollow is undefined");
      return;
    }

    if (user.userID === followUserId) {
      Swal.fire({
        icon: "warning",
        title: "Oops!",
        text: "You cannot follow yourself.",
      });
      return;
    }

    const isFollowing = followedUsers.includes(followUserId);

    try {
      if (isFollowing) {
        const result = await Swal.fire({
          icon: "warning",
          title: `Unfollow ${targetUsername}?`,
          text: `Are you sure you want to unfollow ${targetUsername}?`,
          showCancelButton: true,
          confirmButtonText: "Yes, unfollow",
          cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
          try {
            await axios.delete(
              `${
                import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
              }/unfollow/${followUserId}`,
              {
                data: { followerId: user.userID },
              }
            );

            setFollowedUsers((prev) =>
              prev.filter((id) => id !== followUserId)
            );

            Swal.fire({
              icon: "success",
              title: "Unfollowed",
              text: `You have unfollowed ${targetUsername}.`,
              timer: 2000,
              showConfirmButton: false,
              toast: true,
              position: "top-end",
            });

            await fetchFollowedUsers(user.userID);
          } catch (error) {
            console.error("Error unfollowing user:", error);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: `There was an error unfollowing ${targetUsername}.`,
            });
          }
        }
      } else {
        await axios.post(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/follow/${followUserId}`,
          {
            followerId: user.userID,
          }
        );

        setFollowedUsers((prev) => [...prev, followUserId]);

        Swal.fire({
          icon: "success",
          title: "Followed",
          text: `You are now following ${targetUsername}.`,
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });

        await axios.post(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/notifications/${followUserId}`,
          {
            userID: followUserId,
            actorID: user.userID,
            entryID: null,
            profile_image: user.profile_image,
            type: "follow",
            message: `${user.firstName} ${user.lastName} has followed you.`,
          }
        );

        await fetchFollowedUsers(user.userID);
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "There was an error processing your request.",
      });
    }
  };
  return (
    <>
      <button
        className="secondaryButton p-0 m-0"
        onClick={() => handleFollowToggle(userID, firstName)}
      >
        <h5 className="m-0">
          {followedUsers.includes(userID) ? "Following" : "Follow"}{" "}
        </h5>
      </button>
    </>
  );
};

export default FollowButton;
