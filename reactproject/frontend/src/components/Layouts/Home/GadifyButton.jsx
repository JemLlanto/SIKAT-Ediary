import { useState } from "react";
import axios from "axios";

const GadifyButton = ({ entry, user, entries, setEntryData }) => {
  const [expandButtons, setExpandButtons] = useState();
  const [processing, setProcessing] = useState(false);

  const handleGadify = (entryID) => {
    if (!user) return;

    // const entry = entries.find((entry) => entry.entryID === entryID);
    if (!entry) return;
    console.log("saving gadify");
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/entry/${entryID}/gadify`,
        {
          userID: user.userID,
        }
      )
      .then((res) => {
        const isGadified =
          res.data.message === "Gadify action recorded successfully";
        console.log(res.data.message);

        setProcessing(false);

        // console.log("isGadified: ", Gadified);

        if (isGadified && user.userID !== entry.userID) {
          axios
            .post(
              `${
                import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
              }/notifications/${entry.userID}`,
              {
                actorID: user.userID,
                entryID: entryID,
                profile_image: user.profile_image,
                type: "gadify",
                message: `${user.firstName} ${user.lastName} gadified your diary entry.`,
              }
            )
            .then((res) => {
              //   console.log("Notification response:", res.data);
            })
            .catch((err) => {
              console.error("Error sending gadify notification:", err);
            });
        }
      })
      .catch((err) => console.error("Error updating gadify count:", err));
  };

  const handleClick = (entryID) => {
    // const updatedExpandButtons = { ...expandButtons, [entryID]: true };
    setProcessing(true);
    setEntryData((prevEntry) => ({
      ...prevEntry,
      isGadified: !prevEntry.isGadified,
      gadifyCount: prevEntry.isGadified
        ? prevEntry.gadifyCount - 1
        : prevEntry.gadifyCount + 1,
    }));
    handleGadify(entryID);

    setExpandButtons(entryID);
    // Toggle the value

    setTimeout(() => {
      setExpandButtons();
    }, 300);
  };
  return (
    <button
      className={`InteractButton d-flex align-items-center justify-content-center gap-1 ${
        entry.isGadified ? "active" : ""
      } ${expandButtons === entry.entryID ? "expand" : ""}`}
      onClick={() => handleClick(entry.entryID)}
      disabled={!entry || !user || processing}
    >
      {entry.isGadified ? (
        <i className="bx bxs-heart"></i>
      ) : (
        <i className="bx bx-heart"></i>
      )}
      <span>{entry.gadifyCount}</span>
      <p className="m-0 d-none d-md-block">Gadify</p>
      {processing ? (
        <>
          <i className="bx bx-loader bx-spin"></i>
        </>
      ) : null}
    </button>
  );
};

export default GadifyButton;
