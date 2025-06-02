import DefaultProfile from "../../assets/userDefaultProfile.png";
import FilterButton from "../Layouts/LayoutUser/FilterButton";
import HomeDiaryDropdown from "../Layouts/LayoutUser/HomeDiaryDropdown";
import Spinner from "react-bootstrap/Spinner";

const CenterLoader = () => {
  return (
    <div className="p-2">
      <div
        className="rounded shadow-sm p-3 mt-1"
        style={{ backgroundColor: "white" }}
      >
        <button className="primaryButton w-100 d-flex justify-content-center align-items-center py-2">
          <Spinner animation="border" size="sm" />
          <p className="m-0">Loading...</p>
        </button>
      </div>
      <div className="d-flex justify-content-end">
        <FilterButton />
      </div>
      <div
        className="position-relative rounded shadow-sm p-3 mb-2"
        style={{ backgroundColor: "white" }}
      >
        <div className="position-absolute" style={{ right: "20px" }}>
          <HomeDiaryDropdown></HomeDiaryDropdown>
        </div>
        <div className="d-flex align-items-center border-bottom pb-2 gap-2">
          <div className="profilePicture" style={{ backgroundColor: "#ffff" }}>
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
                width: "50%",
                backgroundColor: "lightgray",
                marginBottom: "10px", // Optional, adds space between divs
              }}
            ></p>
          </div>

          <p
            className="m-0 mt-3 rounded"
            style={{
              height: "250px",
              width: "100%",
              backgroundColor: "lightgray",
              marginBottom: "10px", // Optional, adds space between divs
            }}
          ></p>
        </div>

        <div className="row pt-2">
          <div className="col">
            <button className="InteractButton">
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
          <div className="col">
            <button className="InteractButton">
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
          <div className="col">
            <button className="InteractButton">
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
      <div
        className="position-relative rounded shadow-sm p-3 mb-2"
        style={{ backgroundColor: "white" }}
      >
        <div className="position-absolute" style={{ right: "20px" }}>
          <HomeDiaryDropdown></HomeDiaryDropdown>
        </div>
        <div className="d-flex align-items-center border-bottom pb-2 gap-2">
          <div className="profilePicture" style={{ backgroundColor: "#ffff" }}>
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
                width: "50%",
                backgroundColor: "lightgray",
                marginBottom: "10px", // Optional, adds space between divs
              }}
            ></p>
          </div>
        </div>

        <div className="row pt-2">
          <div className="col">
            <button className="InteractButton">
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
          <div className="col">
            <button className="InteractButton">
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
          <div className="col">
            <button className="InteractButton">
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
      <div
        className="position-relative rounded shadow-sm p-3 mb-2"
        style={{ backgroundColor: "white" }}
      >
        <div className="position-absolute" style={{ right: "20px" }}>
          <HomeDiaryDropdown></HomeDiaryDropdown>
        </div>
        <div className="d-flex align-items-center border-bottom pb-2 gap-2">
          <div className="profilePicture" style={{ backgroundColor: "#ffff" }}>
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
            ></p>{" "}
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

        <div className="row pt-2">
          <div className="col">
            <button className="InteractButton">
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
          <div className="col">
            <button className="InteractButton">
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
          <div className="col">
            <button className="InteractButton">
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
    </div>
  );
};

export default CenterLoader;
