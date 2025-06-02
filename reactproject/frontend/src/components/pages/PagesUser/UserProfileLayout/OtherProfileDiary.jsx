import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileDiaryDropdown from "../../../Layouts/LayoutUser/ProfileDiaryDropdown";
import DefaultProfile from "../../../../../src/assets/userDefaultProfile.png";

const OtherProfileDiary = ({ userID }) => {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeButtons, setActiveButtons] = useState({});
  const [expandButtons, setExpandButtons] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user) {
      const fetchUser = JSON.parse(user);

      fetch(`http://localhost:8081/fetchUserEntry/user/${userID}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("No entry found");
          }
          return response.json();
        })
        .then((data) => {
          setUser(fetchUser);
          setEntries(data.entries);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleClick = (entryID) => {
    const updatedActiveButtons = {
      ...activeButtons,
      [entryID]: !activeButtons[entryID],
    };
    setActiveButtons(updatedActiveButtons);

    const updatedExpandButtons = { ...expandButtons, [entryID]: true };
    setExpandButtons(updatedExpandButtons);

    setTimeout(() => {
      updatedExpandButtons[entryID] = false;
      setExpandButtons({ ...updatedExpandButtons });
    }, 300);

    handleGadify(entryID);
  };

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      {error ? (
        <div>
          <p>{error}</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-1">
          {entries.length === 0 ? (
            <p>No entries available.</p>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.entryID}
                className="position-relative shadow-sm rounded p-3 mb-2"
                style={{ backgroundColor: "white" }}
              >
                <div className="position-absolute" style={{ right: "20px" }}>
                  {/* <ProfileDiaryDropdown></ProfileDiaryDropdown> */}
                </div>
                <div className="d-flex align-items-center gap-2 border-bottom pb-2">
                  <div className="profilePicture">
                    <img
                      src={
                        entry.profile_image
                          ? `http://localhost:8081${entry.profile_image}`
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
                  <p className="m-0">{entry.username}</p>
                </div>

                <div className="text-start border-bottom p-2">
                  <h5>{entry.title}</h5>
                  <p className="m-0">{entry.description}</p>
                  {entry.fileURL && (
                    <img
                      className="DiaryImage mt-1"
                      src={`http://localhost:8081${entry.fileURL}`}
                      alt="Diary"
                    />
                  )}
                </div>

                <div className="row pt-2">
                  <div className="col">
                    <button
                      className={`InteractButton ${
                        activeButtons[entry.entryID] ? "active" : ""
                      } ${expandButtons[entry.entryID] ? "expand" : ""}`}
                      onClick={() => handleClick(entry.entryID)}
                    >
                      <span>({entry.gadifyCount}) </span>Gadify
                    </button>
                  </div>
                  <div className="col">
                    <button className="InteractButton">Comment</button>
                  </div>
                  <div className="col">
                    <button className="InteractButton">Flag</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default OtherProfileDiary;
