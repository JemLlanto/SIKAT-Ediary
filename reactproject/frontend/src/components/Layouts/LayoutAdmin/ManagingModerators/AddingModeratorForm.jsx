import { useState, useEffect } from "react";
import axios from "axios";

const AddingModeratorForm = ({ departmentID, departmentName }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("  ");

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
      })
      .catch((error) => {
        console.error("Error assigning moderator:", error);
        alert("Failed to assign moderator.");
      });
  };

  return (
    <div>
      <h5>Select User to Assign as Moderator</h5>
      <input
        type="text"
        placeholder="Serach User to become moderator"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="form-control mb-2"
      />
      <ul className="list-group">
        {filteredUsers.map((user) => (
          <li
            key={user.userID}
            className={`list-group-item d-flex justify-content-between align-items-center ${
              selectedUser?.userID === user.userID ? "active text-white" : ""
            }`}
          >
            {user.firstName} {user.lastName}
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setSelectedUser(user)}
            >
              {selectedUser?.userID === user.userID ? "Selected" : "Select"}
            </button>
          </li>
        ))}
      </ul>

      <button
        className="btn btn-success mt-3"
        onClick={handleSave}
        disabled={!selectedUser}
      >
        Save
      </button>
    </div>
  );
};

export default AddingModeratorForm;
