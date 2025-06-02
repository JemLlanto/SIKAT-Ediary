import Dropdown from "react-bootstrap/Dropdown";

const HomeDiaryDropdown = () => {
  return (
    <Dropdown>
      <Dropdown.Toggle
        className="btn-light d-flex align-items-center"
        id="dropdown-basic"
        bsPrefix="custom-toggle"
      >
        <h5 className="m-0">...</h5>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item href="#/action-1">
          {" "}
          <button className="btn btn-light w-100 text-start">Report</button>
        </Dropdown.Item>
        {/* <Dropdown.Item href="#/action-2"></Dropdown.Item>
        <Dropdown.Item href="#/action-3"> </Dropdown.Item> */}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default HomeDiaryDropdown;
