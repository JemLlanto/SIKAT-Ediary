import React from "react";
import userDefaultProfile from "../../assets/userDefaultProfile.png";

const DiaryLoader = () => {
  return (
    <div
      className="position-relative rounded shadow-sm p-3 mb-2 d-flex flex-column justify-content-between w-100"
      style={{ backgroundColor: "white" }}
    >
      <div>
        <div className="position-absolute" style={{ right: "20px" }}>
          {/* <HomeDiaryDropdown></HomeDiaryDropdown> */}
        </div>
        <div className="d-flex align-items-center border-bottom pb-2 gap-2">
          <div className="profilePicture" style={{ backgroundColor: "#ffff" }}>
            <img
              src={userDefaultProfile}
              alt="Profile"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
          <p
            className="m-0 mt-2"
            style={{
              height: "14px",
              width: "70px",
              backgroundColor: "lightgray",
              marginBottom: "10px", // Optional, adds space between divs
            }}
          ></p>

          <p
            className="m-0 mt-2"
            style={{
              height: "14px",
              width: "50px",
              backgroundColor: "lightgray",
              marginBottom: "10px", // Optional, adds space between divs
            }}
          ></p>
        </div>

        <div className="text-start border-bottom p-2">
          <h5
            className="m-0 mt-2"
            style={{
              height: "20px",
              width: "190px",
              backgroundColor: "lightgray",
              marginBottom: "10px", // Optional, adds space between divs
            }}
          ></h5>
          <div>
            <p
              className="m-0 mt-3"
              style={{
                height: "14px",
                width: "100%",
                backgroundColor: "lightgray",
                marginBottom: "10px", // Optional, adds space between divs
              }}
            ></p>
            <p
              className="m-0 mt-3"
              style={{
                height: "14px",
                width: "100%",
                backgroundColor: "lightgray",
                marginBottom: "10px", // Optional, adds space between divs
              }}
            ></p>
            <p
              className="m-0 mt-3"
              style={{
                height: "14px",
                width: "100%",
                backgroundColor: "lightgray",
                marginBottom: "10px", // Optional, adds space between divs
              }}
            ></p>
            <p
              className="m-0 mt-3"
              style={{
                height: "14px",
                width: "100%",
                backgroundColor: "lightgray",
                marginBottom: "10px", // Optional, adds space between divs
              }}
            ></p>
            <p
              className="m-0 mt-3"
              style={{
                height: "14px",
                width: "100%",
                backgroundColor: "lightgray",
                marginBottom: "10px", // Optional, adds space between divs
              }}
            ></p>
            <p
              className="m-0 mt-3"
              style={{
                height: "14px",
                width: "50%",
                backgroundColor: "lightgray",
                marginBottom: "10px", // Optional, adds space between divs
              }}
            ></p>
          </div>
        </div>
      </div>

      <div className="row px-3 pt-2 gap-2">
        <div className="col px-0">
          <button className="border rounded bg-white w-100 py-1 px-3">
            <p
              className="m-0 my-2"
              style={{
                height: "14px",
                width: "100%",
                backgroundColor: "lightgray",
                marginBottom: "10px", // Optional, adds space between divs
              }}
            ></p>
          </button>
        </div>
        <div className="col px-0">
          <button className="border rounded bg-white w-100 py-1 px-3">
            <p
              className="m-0 my-2"
              style={{
                height: "14px",
                width: "100%",
                backgroundColor: "lightgray",
                marginBottom: "10px", // Optional, adds space between divs
              }}
            ></p>
          </button>
        </div>
        <div className="col px-0">
          <button className="border rounded bg-white w-100 py-1 px-3">
            <p
              className="m-0 my-2"
              style={{
                height: "14px",
                width: "100%",
                backgroundColor: "lightgray",
                marginBottom: "10px", // Optional, adds space between divs
              }}
            ></p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiaryLoader;
