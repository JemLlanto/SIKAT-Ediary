import Dropdown from "react-bootstrap/Dropdown";

const ProfileDiaryDropdown = () => {
  return (
    <Dropdown>
      <Dropdown.Toggle
        className="btn-light d-flex align-items-center"
        id="dropdown-basic"
        bsPrefix="custom-toggle"
      >
        <h5 className="m-0">...</h5>
      </Dropdown.Toggle>

      <Dropdown.Menu className="p-2">
        <Dropdown.Item className="btn p-0" href="#/action-1">
          <button className="btn btn-light w-100 text-start">Edit</button>
        </Dropdown.Item>
        <Dropdown.Item className="btn p-0" href="#/action-2">
          <button className="btn btn-light w-100 text-start">Delete</button>
        </Dropdown.Item>
        <Dropdown.Item href="#/action-3"> </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ProfileDiaryDropdown;
