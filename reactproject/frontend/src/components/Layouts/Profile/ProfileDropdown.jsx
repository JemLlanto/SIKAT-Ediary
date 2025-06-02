import Dropdown from "react-bootstrap/Dropdown";
// import EditPersonalDetailButton from "../../pages/PagesUser/UserProfileLayout/EditPersonalDetailButton";
import ActivityLogs from "./ActivityLogs";
import FiledCases from "./FiledCases";
import { Link } from "react-router-dom";

const ProfileDropdown = ({ userID, isAdmin }) => {
  return (
    <Dropdown className="d-flex align-items-center">
      <Dropdown.Toggle
        className="btn-light d-flex align-items-center p-0 ms-1"
        id="dropdown-basic"
        bsPrefix
      >
        <div className="d-flex align-items-center gap-2 px-3 py-2">
          <p className="m-0">More Options</p>
          <i
            class="bx bxs-down-arrow"
            style={{ fontSize: "clamp(0.7rem, 1.5dvw, 0.75rem)" }}
          ></i>
        </div>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item className="p-0 px-2 btn btn-light">
          <ActivityLogs userID={userID}></ActivityLogs>
        </Dropdown.Item>
        {isAdmin ? (
          ""
        ) : (
          <Dropdown.Item className="p-0 px-2 btn btn-light">
            <FiledCases userID={userID}></FiledCases>
          </Dropdown.Item>
        )}

        <Dropdown.Item className="p-0 px-2 btn btn-light">
          <Link
            className="text-decoration-none text-dark"
            to={`/Settings/${userID}`}
          >
            <button className="w-100 btn btn-light d-flex align-items-center justify-content-start gap-1">
              <i class="bx bx-cog"></i>
              <p className="m-0  text-start">Settings</p>
            </button>
          </Link>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ProfileDropdown;
