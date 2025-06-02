import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
// import DiaryEntry from "../../../assets/DiaryEntry.png";
// import uploadIcon from "../../../assets/upload.png";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";
import EditSubjectSelection from "../LayoutUser/EditSubjectSelection";
import userDefaultProfile from "../../../assets/userDefaultProfile.png";
import alarmingWords from "../AlarmingWords";
import MessageAlert from "../DiaryEntry/messageAlert";
import MessageModal from "../DiaryEntry/messageModal";

function EditDiaryEntryButton({
  entry,
  entryID,
  onEntrySaved,
  diaryTitle,
  diaryDesc,
  imageFile,
  diaryVisib,
  diaryAnon,
  diarySub,
}) {
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [visibility, setVisibility] = useState(diaryVisib);
  const [anonimity, setAnonimity] = useState(diaryAnon);
  const [file, setFile] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState(diarySub);
  const [alarmingWordWarning, setAlarmingWordWarning] = useState("");
  const [fileError, setFileError] = useState("");
  const [imagePreview, setImagePreview] = useState(imageFile);

  const [modal, setModal] = useState({ show: false, message: "" });
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
  });

  const closeModal = () => {
    setModal({ show: false, message: "" });
  };
  const closeConfirmModal = () => {
    setConfirmModal({
      show: false,
      message: "",
      onConfirm: () => {},
      onCancel: () => {},
    });
  };

  const handleSubjectsChange = (subjectsText) => {
    setSelectedSubjects(subjectsText);
  };

  const navigate = useNavigate();

  const handleChangeVisibility = (event) => {
    setVisibility(event.target.value);
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
    const maxSize = 5 * 1024 * 1024;

    if (selectedFile) {
      if (selectedFile.size > maxSize) {
        setFileError(
          "File size exceeds the 2MB limit. Please select a smaller file."
        );
        setFile(null);
        setImagePreview(null);
      } else {
        setFileError("");
        setFile(selectedFile);
        setImagePreview(null);
      }
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
      console.table(JSON.parse(userData));
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
    setAlarmingWordWarning("");
  };

  const handleShow = () => {
    setTitle(diaryTitle);
    setDescription(diaryDesc);
    setShow(true);
  };

  const containsAlarmingWords = (text) => {
    return alarmingWords.some((word) => text.toLowerCase().includes(word));
  };

  const handleSubmit = () => {
    let errors = {};
    if (!title) errors.title = "Title is required.";
    if (!description) errors.description = "Description is required.";
    setFormErrors(errors);

    if (containsAlarmingWords(title) || containsAlarmingWords(description)) {
      setAlarmingWordWarning(
        "Warning: Your entry contains potentially harmful words. Proceed with caution."
      );
    } else {
      setAlarmingWordWarning("");
    }

    if (Object.keys(errors).length > 0) return;

    if (!user || !user.userID) {
      setServerError("User not authenticated. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("userID", user.userID);
    formData.append("visibility", visibility);
    formData.append("anonimity", anonimity);

    if (selectedSubjects && selectedSubjects.trim() !== "") {
      formData.append("subjects", selectedSubjects);
    }

    if (file) {
      formData.append("file", file);
    }

    setLoading(true);
    setServerError("");

    axios
      .put(`http://localhost:8081/editEntry/${entryID}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log(response.data.message);
        setTitle("");
        setDescription("");
        setFile(null);
        if (onEntrySaved) {
          onEntrySaved();
        }
        setModal({
          show: true,
          message: `Diary edited.`,
        });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      })
      .catch((error) => {
        console.error("There was an error saving the diary entry!", error);
        setServerError("Failed to save diary entry. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <button
        className="btn btn-light w-100 d-flex align-items-center justify-content-center gap-1"
        onClick={handleShow}
      >
        <MessageModal
          showModal={modal}
          closeModal={closeModal}
          title={"Notice"}
          message={modal.message}
        ></MessageModal>
        <MessageModal
          showModal={confirmModal}
          closeModal={closeConfirmModal}
          title={"Confirmation"}
          message={confirmModal.message}
          confirm={confirmModal.onConfirm}
          needConfirm={1}
        ></MessageModal>

        <i className="bx bxs-edit m-0 ms-1"></i>
        <p className="m-0">Edit </p>
      </button>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <h5 className="m-0">Edit Diary </h5>
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
              <p className="m-0" style={{ maxWidth: "75%" }}>
                {user?.firstName} {user?.lastName || "User"}
              </p>
            </div>
            <div className="row d-flex flex-column flex-md-row justify-content-center align-items-center gap-1 mx-2">
              <div class="col input-group p-0">
                <select
                  class="form-select"
                  id="visibility"
                  value={visibility}
                  onChange={handleChangeVisibility}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div class="col input-group p-0">
                <select
                  class="form-select"
                  id="anonimity"
                  value={anonimity}
                  onChange={handleChangeAnonimity}
                  disabled={visibility === "private"}
                >
                  <option value="private">Anonymous</option>
                  <option value="public">Not Anonymous</option>
                </select>
              </div>
            </div>
          </div>
          {serverError && <p className="text-danger">{serverError}</p>}
          {alarmingWordWarning && (
            <p className="text-warning">{alarmingWordWarning}</p>
          )}
          <div
            className="mt-1 d-flex align-items-center gap-1"
            style={{ zIndex: "1" }}
          >
            <EditSubjectSelection onSubjectsChange={handleSubjectsChange} />

            <div className="">
              <p className="m-0 text-secondary">{diarySub}</p>
            </div>
          </div>
          <div
            className="mt-1 pe-1 overflow-y-scroll custom-scrollbar"
            style={{ maxHeight: "50dvh" }}
          >
            <InputGroup className="mb-1">
              <Form.Control
                className="rounded"
                placeholder={diaryTitle}
                aria-label="Journal Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                isInvalid={!!formErrors.title}
                disabled={loading}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.title}
              </Form.Control.Feedback>
            </InputGroup>
            <FloatingLabel
              controlId="floatingTextarea2"
              label={`Describe your day, ${user?.firstName || "User"}!`}
              style={{ zIndex: "0" }}
            >
              <Form.Control
                as="textarea"
                placeholder=""
                style={{ height: "100px" }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                isInvalid={!!formErrors.description}
                disabled={loading}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.description}
              </Form.Control.Feedback>
            </FloatingLabel>
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
                {/* <div
                  className="position-absolute rounded"
                  onClick={removePreview}
                  style={{
                    right: "1rem",
                    top: "1rem",
                    backgroundColor: "rgb(242, 242, 242,.5)",
                  }}
                >
                  <h4 className="m-0 d-flex justify-content-center text-dark">
                    <i class="bx bx-x"></i>
                  </h4>
                </div> */}
              </div>
            ) : (
              // <div className="mt-1">
              //   <label className="w-100" htmlFor="uploadPhoto">
              //     <div
              //       className="d-flex justify-content-center border rounded py-2 "
              //       style={{ cursor: "pointer" }}
              //     >
              //       <p className="m-0 d-flex align-items-center gap-1 text-secondary">
              //         <i
              //           class="bx bx-image-add bx-sm"
              //           style={{ color: "var(--secondary)" }}
              //         ></i>
              //         Upload Photo
              //       </p>
              //     </div>
              //   </label>
              //   <input
              //     type="file"
              //     id="uploadPhoto"
              //     hidden
              //     onChange={handleFileChange}
              //   />
              // </div>
              ""
            )}
            {/* {file && (
                <div className="mt-2 d-flex align-items-center gap-2">
                  <p className="text-success m-0">
                    Selected file: <strong>{file.name}</strong>
                  </p>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => setFile(null)} // Clears the file
                    aria-label="Remove selected file"
                  >
                    Remove
                  </Button>
                </div>
              )} */}
            {fileError && <p className="text-danger mt-2">{fileError}</p>}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            <p className="m-0">Close</p>
          </Button>
          <button
            className="orangeButton py-2"
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
                  Saving Changes...
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

export default EditDiaryEntryButton;
