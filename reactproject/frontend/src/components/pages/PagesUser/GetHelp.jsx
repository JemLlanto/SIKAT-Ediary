import React, { useState } from "react";
import { PreLoader } from "../PreLoader";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import SubjectSelection from "../../Layouts/LayoutUser/SubjectSelection";
import axios from "axios";
import MainLayout from "../../Layouts/MainLayout";

import { Link, useNavigate, useParams } from "react-router-dom";
import MessageAlert from "../../Layouts/DiaryEntry/messageAlert";
import BackButton from "../../Layouts/Home/BackButton";

const GetHelp = () => {
  const navigate = useNavigate();
  const { userID } = useParams();
  const [selectedSubjects, setSelectedSubjects] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    victimName: "",
    perpetratorName: "",
    contactInfo: "",
    gender: "",
    incidentDescription: "",
    location: "",
    date: "",
    selectedSubjects: "",
    supportingDocuments: [null, null, null, null, null],
  });

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

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];

      // Check if the file size exceeds 5MB (5 * 1024 * 1024 bytes)
      if (file.size > 5 * 1024 * 1024) {
        setModal({
          show: true,
          message: `File size exceeds 5MB`,
        });
        const updatedDocuments = [...formData.supportingDocuments];
        const index = parseInt(name.split("_")[1], 10);
        updatedDocuments[index] = null;
        setFormData({ ...formData, supportingDocuments: updatedDocuments });
      } else {
        const updatedDocuments = [...formData.supportingDocuments];
        const index = parseInt(name.split("_")[1], 10);

        updatedDocuments[index] = {
          file,
          preview: URL.createObjectURL(file),
        };

        setFormData({ ...formData, supportingDocuments: updatedDocuments });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRemoveImage = (index) => {
    const updatedDocuments = [...formData.supportingDocuments];
    updatedDocuments[index] = null;
    setFormData({ ...formData, supportingDocuments: updatedDocuments });
  };

  const handleSubmit = async (e) => {
    let errors = {};
    e.preventDefault();

    if (!selectedSubjects || selectedSubjects.trim() === "") {
      errors.subjects = "At least one subject must be selected.";
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "supportingDocuments") {
        formData.supportingDocuments.forEach((doc) => {
          if (doc) data.append("supportingDocuments", doc.file);
        });
      } else {
        data.append(key, formData[key]);
      }
    });

    if (selectedSubjects && selectedSubjects.trim() !== "") {
      data.append("subjects", selectedSubjects);
    }

    try {
      const response = await axios.post(
        `http://localhost:8081/submit-report/${userID}`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setModal({
        show: true,
        message: `Case filed successfully.`,
      });
      setTimeout(() => {
        navigate("/Home");
      }, 2000);
    } catch (error) {
      console.error("Error submitting report:", error);
      setModal({
        show: true,
        message: `Error submitting report. Invalid file type.`,
      });
    }
  };

  return (
    <MainLayout>
      <BackButton />
      {/* <PreLoader /> */}

      <MessageAlert
        showModal={modal}
        closeModal={closeModal}
        title={"Notice"}
        message={modal.message}
      ></MessageAlert>

      <div className="d-flex justify-content-center py-3 mt-3 mt-md-1">
        <div
          className="container-fluid container-md rounded shadow p-3"
          style={{
            backgroundColor: "#ffff",
            // width: "50rem",
          }}
        >
          <div className="border-bottom border-2">
            <h4>Complaint Form for Gender-Based Incidents</h4>
          </div>

          <form
            onSubmit={handleSubmit}
            className="text-start"
            style={{ minHeight: "20rem" }}
          >
            <h5 className="mt-2">Report Details</h5>
            <div className="input-group mb-1">
              <input
                type="text"
                className="form-control"
                placeholder="Victim's Name(Optional)"
                name="victimName"
                value={formData.victimName}
                onChange={handleChange}
              />
            </div>
            <div className="row">
              <div className="col-md input-group mb-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Contact Number"
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md">
                <Form.Select
                  className="ps-3 rounded"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  aria-label="Default select example"
                >
                  <option value="">Sex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="prefer not to say">Prefer not to say</option>
                </Form.Select>
              </div>
            </div>

            {/* Incident Details */}
            <h5 className="my-2">
              Incident Details{" "}
              {!selectedSubjects && (
                <span className="text-danger">*{formErrors.subjects}</span>
              )}
              {selectedSubjects && (
                <span className="text-success">*{selectedSubjects}</span>
              )}
            </h5>
            <div className="row">
              <div className="col-md input-group mb-1 ">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Perpetrator's Name(Optional)"
                  name="perpetratorName"
                  value={formData.perpetratorName}
                  onChange={handleChange}
                />
              </div>
              <div className="col-lg-2 ps-lg-1 mb-1">
                <SubjectSelection onSubjectsChange={handleSubjectsChange} />
              </div>
            </div>

            <FloatingLabel
              controlId="floatingTextarea2"
              label="Description of the Incident"
              style={{ zIndex: "0" }}
            >
              <Form.Control
                placeholder="Description of the Incident"
                as="textarea"
                style={{ height: "100px" }}
                name="incidentDescription"
                value={formData.incidentDescription}
                onChange={handleChange}
                required
              />
            </FloatingLabel>

            <div className="row">
              <div className="col-sm-12 col-md input-group mb-1 d-flex flex-column">
                <label htmlFor="location" className="form-label m-0">
                  Location of Incident
                </label>
                <input
                  type="text"
                  className="form-control w-100"
                  name="location"
                  placeholder="Enter the location of the incident (e.g., Casa Amaya, Tanza, Cavite)"
                  value={formData.location}
                  onChange={handleChange}
                  style={{ borderRadius: "0.43rem" }}
                  required
                />
              </div>

              <div className="col-sm-12 col-md input-group mb-1 d-flex flex-column">
                <label htmlFor="date" className="form-label m-0">
                  Date of Incident
                </label>
                <input
                  type="date"
                  className="form-control w-100 border"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  style={{ borderRadius: "0.43rem" }}
                />
              </div>
            </div>

            <div className="d-flex flex-column justify-content-between">
              <div>
                <h5 className="my-2 text-center text-md-start">
                  Upload Supporting Documents (Optional, Up to 5 Photos)
                </h5>
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  {formData.supportingDocuments.map((doc, index) => {
                    const shouldDisplayInput =
                      index === 0 ||
                      formData.supportingDocuments[index - 1] !== null;

                    return (
                      shouldDisplayInput && (
                        <div key={index} className="mb-1">
                          {doc ? (
                            <div
                              className="position-relative"
                              style={{
                                width: "clamp(10rem, 13dvw, 12rem)",
                                height: "clamp(13rem, 15dvw, 15rem)",
                              }}
                            >
                              <img
                                className="imagePreview"
                                src={doc.preview}
                                alt={`preview ${index}`}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  border: "1px solid #ddd",
                                  borderRadius: "4px",
                                }}
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm position-absolute"
                                onClick={() => handleRemoveImage(index)}
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  top: ".3rem",
                                  right: ".3rem",
                                }}
                              >
                                x
                              </button>
                            </div>
                          ) : (
                            <label
                              htmlFor={`supportingDocuments_${index}`}
                              className="form-label d-flex flex-column justify-content-center align-items-center"
                              style={{
                                width: "clamp(10rem, 13dvw, 15rem)",
                                height: "clamp(13rem, 15dvw, 15rem)",
                                border: "2px dashed #aaa",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                            >
                              <i className="bx bx-image-add bx-md text-secondary"></i>
                              <span className="text-secondary small">
                                Upload
                              </span>
                              <input
                                hidden
                                id={`supportingDocuments_${index}`}
                                type="file"
                                name={`supportingDocuments_${index}`}
                                className="form-control"
                                onChange={handleChange}
                                accept="image/*"
                              />
                            </label>
                          )}
                        </div>
                      )
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-2">
              <button className="primaryButton w-100 py-2" type="submit">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default GetHelp;
