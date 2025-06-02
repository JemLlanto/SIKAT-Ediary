import Dropdown from "react-bootstrap/Dropdown";
import ReportUserProfileButton from "./ReportUserProfileButton";
import Suspend from "./Suspend";
import ProfileReview from "./ProfileReview";

const OthersProfileDropdown = ({ user, profileOwner }) => {
  return (
    <Dropdown className="d-flex align-items-center">
      <Dropdown.Toggle
        className="btn-light d-flex align-items-center p-0 ms-1"
        id="dropdown-basic"
        bsPrefix
      >
        <button className="btn btn-bg-secondary bg-secondary-subtle d-lg-none p-0 px-2 py-1">
          <i class="bx bx-dots-vertical-rounded "></i>
        </button>
        <div className="align-items-center gap-2 d-none d-lg-flex px-3 py-2">
          <p className="m-0">More Options </p>
          <i
            class="bx bxs-down-arrow"
            style={{ fontSize: "clamp(0.7rem, 1.5dvw, 0.75rem)" }}
          ></i>
        </div>
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ zIndex: "1" }}>
        {user.isAdmin ? (
          ""
        ) : user.isAdmin ? (
          <></>
        ) : (
          <Dropdown.Item href="" className="p-0 px-2 btn btn-light">
            <ReportUserProfileButton
              user={user}
              profileOwner={profileOwner}
            ></ReportUserProfileButton>
          </Dropdown.Item>
        )}

        {/* {isAdmin ? "im admin" : "Im not an Admin"} */}
        {user.isAdmin ? (
          <Dropdown.Item className="btn btn-light p-0 px-2">
            {/* <button className="w-100 btn btn-light text-start">Suspend</button> */}
            <Suspend profileOwner={profileOwner}></Suspend>
            <ProfileReview profileOwner={profileOwner}></ProfileReview>
          </Dropdown.Item>
        ) : (
          ""
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default OthersProfileDropdown;
