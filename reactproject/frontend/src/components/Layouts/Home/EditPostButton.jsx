import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import uploadIcon from "../../../assets/upload.png";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";
import SubjectSelection from "../LayoutUser/SubjectSelection";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import userDefaultProfile from "../../../assets/userDefaultProfile.png";

function EditPostButton({
  entry,
  entryID,
  onEntrySaved,
  diaryTitle,
  diaryDesc,
  imageFile,
  diaryVisib,
  diaryAnon,
  diarySub,
  scheduledDate,
}) {
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [visibility, setVisibility] = useState(
    scheduledDate ? "later" : "null"
  );
  const [anonimity, setAnonimity] = useState("now");
  const [file, setFile] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    scheduledDate ? new Date(scheduledDate) : null
  );

  const [imagePreview, setImagePreview] = useState(imageFile);
  const removePreview = () => {
    setFile(null);
    setImagePreview(null);
  };

  const navigate = useNavigate();

  const handleChangeVisibility = (event) => {
    setVisibility(event.target.value);
    if (event.target.value === "now") {
      setSelectedDate(null);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate((prevDate) => {
      if (!prevDate) return date;
      return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        prevDate.getHours(),
        prevDate.getMinutes()
      );
    });
  };

  const handleTimeChange = (time) => {
    setSelectedDate((prevDate) => {
      if (!prevDate) return time;
      return new Date(
        prevDate.getFullYear(),
        prevDate.getMonth(),
        prevDate.getDate(),
        time.getHours(),
        time.getMinutes()
      );
    });
  };

  const handleChangeAnonimity = (event) => {
    setAnonimity(event.target.value);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setImagePreview(URL.createObjectURL(selectedFile));
    } else {
      setImagePreview(null);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleClose = () => {
    setShow(false);
    setFormErrors({});
    setServerError("");
    setTitle("");
    setDescription("");
    setFile(null);
    setSelectedDate(null);
    setImagePreview(null);
  };

  const handleShow = () => {
    setTitle(diaryTitle);
    setDescription(diaryDesc);
    setShow(true);
  };

  const handleSubmit = () => {
    let errors = {};
    if (!title) errors.title = "Title is required.";
    if (!description) errors.description = "Description is required.";
    if (visibility === "later" && !selectedDate) {
      errors.scheduledDate = "Please select a date and time for your post.";
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    let utcScheduledDate = null;
    if (selectedDate) {
      // Use `selectedDate` instead of `scheduledDate`
      utcScheduledDate = new Date(selectedDate);
      utcScheduledDate.setMinutes(
        utcScheduledDate.getMinutes() - utcScheduledDate.getTimezoneOffset()
      );
    }

    const formData = new FormData(); // Ensure this is declared at the correct place
    formData.append("title", title);
    formData.append("description", description);
    formData.append("userID", user?.userID);
    if (selectedDate) {
      formData.append("scheduledDate", utcScheduledDate.toISOString());
    }

    if (file) {
      formData.append("file", file);
    }

    setLoading(true);
    setServerError("");

    axios
      .put(`http://localhost:8081/editEntryAdmin/${entryID}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log("Post created:", response.data.message);
        setTitle("");
        setDescription("");
        setFile(null);
        handleClose();
        if (onEntrySaved) onEntrySaved();
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error saving post:", error);
        setServerError("Failed to save post. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <button
        className="btn btn-light w-100 d-flex align-items-center justify-content-center gap-1"
        onClick={handleShow}
      >
        <i className="bx bxs-edit m-0 ms-1"></i>
        <p className="m-0">Edit</p>
      </button>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <h5 className="m-0">Edit Post {entryID}</h5>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex align-items-center gap-2 border-bottom pb-2">
            <div className="d-flex align-items-center gap-2">
              <div className="profilePicture">
                <img
                  src={
                    user?.profile_image
                      ? `http://localhost:8081${user?.profile_image}`
                      : userDefaultProfile
                  }
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              {/* <p className="m-0">{user?.username || "User"} </p> */}
            </div>

            <div className="w-100 row d-flex flex-column flex-md-row justify-content-center align-items-center gap-1 mx-2">
              <div class=" col-12 input-group p-0">
                <select
                  class="form-select"
                  id="visibility"
                  value={visibility}
                  onChange={handleChangeVisibility}
                  style={{ fontSize: "clamp(0.8rem, 2dvw, 0.9rem)" }}
                >
                  <option value="now">
                    <p className="m-0">Post Now</p>
                  </option>
                  <option value="later">
                    <p className="m-0">Post Later</p>
                  </option>
                </select>
              </div>
              {visibility === "later" && (
                <div className="col position-relative">
                  <div className="row gap-1">
                    <div className="col-md p-0">
                      {/* Date Picker */}
                      <DatePicker
                        selected={selectedDate}
                        onChange={handleDateChange}
                        dateFormat="MMMM d, yyyy"
                        className="form-control"
                        placeholderText="Select a Day and Month"
                      />
                    </div>
                    <div className="col-md p-0">
                      {/* Time Picker */}
                      <DatePicker
                        selected={selectedDate}
                        onChange={handleTimeChange}
                        dateFormat="hh:mm aa"
                        showTimeSelect
                        showTimeSelectOnly
                        className="form-control"
                        placeholderText="Select Time"
                      />
                    </div>
                  </div>
                  {/* Error Message */}
                  {formErrors.scheduledDate && (
                    <div className="text-danger mt-1">
                      {formErrors.scheduledDate}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {serverError && <p className="text-danger">{serverError}</p>}

          <div
            className="mt-2 pe-1 overflow-y-scroll custom-scrollbar"
            style={{ maxHeight: "50dvh" }}
          >
            <InputGroup className="mb-1">
              <Form.Control
                className="rounded"
                placeholder={diaryTitle}
                aria-label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                isInvalid={!!formErrors.title}
                disabled={loading}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.title}
              </Form.Control.Feedback>
            </InputGroup>

            {/* <FloatingLabel controlId="floatingTextarea2" label="Description">
              <Form.Control as="textarea" style={{ height: "100px" }} />
              <Form.Control.Feedback type="invalid">
                {formErrors.description}
              </Form.Control.Feedback>
            </FloatingLabel> */}

            <FloatingLabel controlId="floatingTextarea2" label="Description">
              <Form.Control
                as="textarea"
                placeholder="Leave a comment here"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                isInvalid={!!formErrors.description}
                disabled={loading}
                style={{ height: "100px" }}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.description}
              </Form.Control.Feedback>
            </FloatingLabel>

            {/* Display selected file preview */}
            {imagePreview ? (
              <div className="mt-1 position-relative">
                <img
                  src={imagePreview}
                  alt="Selected Preview"
                  style={{
                    width: "100%",
                    maxHeight: "100%",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              </div>
            ) : null}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            <p className="m-0">Close</p>
          </Button>
          <button
            className="orangeButton py-2 px-3"
            variant="primary"
            onClick={handleSubmit}
            disabled={loading}
            aria-label="Save diary entry"
          >
            <p className="m-0">
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />{" "}
                  Saving Changes
                </>
              ) : (
                "Save Changes"
              )}
            </p>
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default EditPostButton;
