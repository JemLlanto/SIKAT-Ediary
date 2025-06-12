import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import AddingModeratorForm from "./AddingModeratorForm";
import axios from "axios";
import Swal from "sweetalert2";

const ManagingModeratorButton = ({
  fetchModerator,
  departmentID,
  departmentName,
  moderators,
}) => {
  const [addingModerator, setAddingModerator] = useState(false);
  const [manageModerator, setManageModerator] = useState(false);
  const [isLoadingMod, setIsLoadingMod] = useState();

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
      .get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/users`)
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
      Swal.fire({
        icon: "warning",
        title: "No User Selected",
        text: "Please select a user before assigning.",
      });
      return;
    }
    setIsLoadingMod(true);
    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/assignModerator`,
        {
          userID: selectedUser.userID,
          departmentID,
          departmentName,
        }
      )
      .then((response) => {
        Swal.fire({
          icon: "success",
          title: "Moderator Assigned",
          text: response.data.message,
        });
        fetchModerator();
        setSelectedUser(null);
        setSearchTerm("");
        setIsLoadingMod(false);
      })
      .catch((error) => {
        console.error("Error assigning moderator:", error);
        Swal.fire({
          icon: "error",
          title: "Failed to Assign Moderator",
          text: "An error occurred while assigning the moderator.",
        });
        setIsLoadingMod(false);
      });
  };

  const handleRemove = async (mod) => {
    if (!mod) {
      Swal.fire({
        icon: "warning",
        title: "No User Selected",
        text: "Please select a user to remove as moderator.",
      });
      return;
    }

    try {
      setIsLoadingMod(mod.userID);
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/removeModerator`,
        {
          userID: mod.userID,
        }
      );

      Swal.fire({
        icon: "success",
        title: "Moderator Removed",
        text: response.data.message,
      });
      fetchModerator();
      setSelectedUser(null);
      setSearchTerm("");
    } catch (error) {
      console.error("Error removing moderator:", error);
      Swal.fire({
        icon: "error",
        title: "Removal Failed",
        text: "Failed to remove moderator. Please try again later.",
      });
    } finally {
      setIsLoadingMod();
    }
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
                      <p className="m-0">
                        {user.firstName} {user.lastName}
                      </p>
                      <button
                        className={` ${
                          selectedUser?.userID === user.userID
                            ? "btn btn-light py-1"
                            : "primaryButton"
                        }`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <p className="m-0">
                          {selectedUser?.userID === user.userID
                            ? "Selected"
                            : "Select"}
                        </p>
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
                                src={`${
                                  import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
                                }${mod.profile_image}`}
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
                            disabled={isLoadingMod === mod.userID}
                          >
                            <p className="m-0">
                              {isLoadingMod === mod.userID ? (
                                <>
                                  <span className="d-flex align-items-center justify-content-center gap-1">
                                    <i className="bx bx-loader bx-spin"></i>
                                    Removing
                                  </span>
                                </>
                              ) : (
                                <>Remove</>
                              )}
                            </p>
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
                disabled={!selectedUser || isLoadingMod}
                style={{ width: "100%" }}
              >
                <p className="m-0">
                  {isLoadingMod ? (
                    <>
                      <span className="d-flex align-items-center justify-content-center my-1">
                        <i className="bx bx-loader bx-spin"></i>
                      </span>
                    </>
                  ) : (
                    <>Save</>
                  )}
                </p>
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
