import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import AddingModeratorForm from "./AddingModeratorForm";
import axios from "axios";

const ManagingModeratorButton = ({
  departmentID,
  departmentName,
  moderators,
}) => {
  const [addingModerator, setAddingModerator] = useState(false);
  const [manageModerator, setManageModerator] = useState(false);

  const handleCloseManageModerator = () => {
    setAddingModerator(false);
    setManageModerator(false);
  };

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8081/users")
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) =>
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleSave = () => {
    if (!selectedUser) {
      alert("Please select a user.");
      return;
    }

    axios
      .post("http://localhost:8081/assignModerator", {
        userID: selectedUser.userID,
        departmentID,
        departmentName,
      })
      .then((response) => {
        alert(response.data.message);
        setSelectedUser(null);
        setSearchTerm("");
      })
      .catch((error) => {
        console.error("Error assigning moderator:", error);
        alert("Failed to assign moderator.");
      });
  };

  const handleRemove = (mod) => {
    if (!mod) {
      alert("Please select a user.");
      return;
    }

    axios
      .post("http://localhost:8081/removeModerator", {
        userID: mod.userID,
      })
      .then((response) => {
        alert(response.data.message);
        setSelectedUser(null);
        setSearchTerm("");
      })
      .catch((error) => {
        console.error("Error removing moderator:", error);
        alert("Failed to remove moderator.");
      });
  };

  return (
    <>
      <button className="purpleButton" onClick={() => setManageModerator(true)}>
        <p className="m-0 text-center align-middle">Manage</p>
      </button>

      <Modal
        show={manageModerator}
        onHide={handleCloseManageModerator}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 className="m-0">{departmentName}</h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="overflow-x-hidden overflow-y-scroll custom-scrollbar"
          style={{ height: "19.3rem" }}
        >
          {addingModerator ? (
            <div className={addingModerator ? "fade-right" : "fade-left"}>
              <div>
                <h5>Add new moderator</h5>
                <input
                  type="text"
                  placeholder="Search user"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control mb-2"
                />
                <ul className="list-group">
                  {filteredUsers.slice(0, 10).map((user) => (
                    <li
                      key={user.userID}
                      className={`list-group-item d-flex justify-content-between align-items-center ${
                        selectedUser?.userID === user.userID
                          ? "active text-white"
                          : ""
                      }`}
                    >
                      {user.firstName} {user.lastName}
                      <button
                        className=" primaryButton "
                        onClick={() => setSelectedUser(user)}
                      >
                        {selectedUser?.userID === user.userID
                          ? "Selected"
                          : "Select"}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div
              className={`d-flex flex-column  gap-2 ${
                addingModerator ? "fade-right" : "fade-left"
              }`}
            >
              {moderators.filter((mod) => departmentID === mod.departmentID)
                .length > 0 ? (
                moderators
                  .filter((mod) => departmentID === mod.departmentID)
                  .map((mod) => (
                    <>
                      <div className="d-flex align-items-center justify-content-between gap-2">
                        <div className="d-flex align-items-center gap-2">
                          <Link
                            key={mod.userID}
                            to={`/Profile/${mod.userID}`}
                            className="linkText rounded p-0"
                          >
                            <div className="profilePicture">
                              <img
                                src={`http://localhost:8081${mod.profile_image}`}
                                alt="Profile"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                          </Link>
                          <Link
                            to={`/Profile/${mod.userID}`}
                            className="linkText rounded p-0"
                          >
                            <p className="m-0 text-center align-middle">
                              {mod.firstName} {mod.lastName}
                            </p>
                          </Link>
                        </div>

                        <div className="d-flex align-items-center gap-1">
                          <button
                            className="btn btn-danger"
                            onClick={() => {
                              handleRemove(mod);
                            }}
                          >
                            <p className="m-0">Remove</p>
                          </button>
                        </div>
                      </div>
                    </>
                  ))
              ) : (
                <>
                  <p className="m-0 text-secondary text-center">
                    No moderator.
                  </p>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {addingModerator ? (
            <div className="d-flex align-items-center gap-1">
              <button
                className="grayButton py-2"
                onClick={() => setAddingModerator(false)}
              >
                <p className="m-0 ">Cancel</p>
              </button>

              <button
                className="primaryButton py-2 rounded"
                onClick={handleSave}
                disabled={!selectedUser}
              >
                <p className="m-0">Save</p>
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-1">
              <button
                className="grayButton py-2"
                onClick={handleCloseManageModerator}
              >
                <p className="m-0 ">Close</p>
              </button>
              <button className="primaryButton py-2 rounded">
                <p className="m-0" onClick={() => setAddingModerator(true)}>
                  Add Moderator
                </p>
              </button>
            </div>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ManagingModeratorButton;
