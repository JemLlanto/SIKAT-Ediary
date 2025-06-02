import DefaultProfile from "../../assets/userDefaultProfile.png";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";

export const LeftSideLoader = () => {
  const loadingEntry = Array(8).fill(null); // Creates an array of 5 null values
  return (
    <div className="p-2">
      <div className="mainProfilePicture d-flex align-items-center flex-column rounded gap-2 shadow py-3">
        <div>
          <div className="d-flex justify-content-center align-items-center">
            <div
              style={{
                backgroundColor: "#ffff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "21vh",
                height: "21vh",
                borderRadius: "50%",
                overflow: "hidden",
              }}
            >
              <img
                src={DefaultProfile}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          </div>
        </div>
        <p className="m-0 mt-1 text-light fs-5">
          <Spinner animation="grow" size="sm" />
          Loading
        </p>
      </div>

      <div className=" mt-3">
        <div className="d-flex justify-content-between border-bottom">
          <div>
            <h4
              className="m-0 mt-2"
              style={{
                height: "20px",
                width: "170px",
                backgroundColor: "lightgray",
                marginBottom: "10px", // Optional, adds space between divs
              }}
            ></h4>
          </div>
          <div>
            <p
              className="m-0 mt-2 me-2"
              style={{
                height: "14px",
                width: "60px",
                backgroundColor: "lightgray",
                marginBottom: "10px", // Optional, adds space between divs
              }}
            ></p>
          </div>
        </div>
        <div
          className="mt-2 ps-3 custom-scrollbar"
          style={{ height: "45vh", overflowY: "hidden" }}
        >
          {loadingEntry.map((_, index) => (
            <div
              key={index}
              className="d-flex align-items-start flex-column rounded ps-2 mt-3"
            >
              <h6
                style={{
                  height: "20px",
                  width: "80%",
                  backgroundColor: "lightgray",
                  marginBottom: "10px", // Optional, adds space between divs
                }}
              ></h6>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
