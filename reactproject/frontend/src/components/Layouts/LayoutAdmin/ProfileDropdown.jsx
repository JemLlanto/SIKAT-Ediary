import Dropdown from "react-bootstrap/Dropdown";
import EditPersonalDetailButton from "../../pages/PagesUser/UserProfileLayout/EditPersonalDetailButton";

const ProfileDropdown = () => {
  return (
    <Dropdown>
      <Dropdown.Toggle
        className="btn-light d-flex align-items-center"
        id="dropdown-basic"
      >
        <p className="m-0">More Options</p>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item href="#/action-1">
          <button className="w-100 btn btn-light text-start">
            Activity log
          </button>
        </Dropdown.Item>
        <Dropdown.Item href="#/action-2">
          <button className="w-100 btn btn-light text-start">Filed Case</button>
        </Dropdown.Item>
        <Dropdown.Item href="#/action-3">
          <EditPersonalDetailButton></EditPersonalDetailButton>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ProfileDropdown;
