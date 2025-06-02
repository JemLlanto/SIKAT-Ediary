import Dropdown from "react-bootstrap/Dropdown";
import ReportButton from "../CommentSection/ReportCommentButton";

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

      <Dropdown.Menu className="p-0">
        <Dropdown.Item
          className="p-2"
          style={{ backgroundColor: "transparent" }}
        >
          <ReportButton></ReportButton>
        </Dropdown.Item>
        {/* <Dropdown.Item href="#/action-2"></Dropdown.Item>
        <Dropdown.Item href="#/action-3"> </Dropdown.Item> */}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default HomeDiaryDropdown;
