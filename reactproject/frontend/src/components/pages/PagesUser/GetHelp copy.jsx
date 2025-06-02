import React, { useState } from "react";
import UserPageMainLayout from "../../Layouts/MainLayout";
import { PreLoader } from "../PreLoader";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import SubjectSelection from "../../Layouts/LayoutUser/SubjectSelection";
import axios from "axios";
import MainLayout from "../../Layouts/MainLayout";

const GetHelp = () => {
  const [formData, setFormData] = useState({
    victimName: "",
    perpetratorName: "",
    contactInfo: "",
    gender: "",
    incidentDescription: "",
    location: "",
    date: "",
    supportingDocuments: [null, null, null, null, null], // Initialized with 5 nulls for the 5 inputs
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];
      const updatedDocuments = [...formData.supportingDocuments];
      const index = parseInt(name.split("_")[1], 10); // Extracting index from input name

      updatedDocuments[index] = {
        file,
        preview: URL.createObjectURL(file), // Create preview URL
      };

      setFormData({ ...formData, supportingDocuments: updatedDocuments });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRemoveImage = (index) => {
    const updatedDocuments = [...formData.supportingDocuments];
    updatedDocuments[index] = null; // Remove file from array
    setFormData({ ...formData, supportingDocuments: updatedDocuments });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    try {
      const response = await axios.post(
        "http://localhost:8081/submit-report",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert(response.data.message);
      window.location.reload();
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Error submitting report");
    }
  };

  return (
    <MainLayout>
      <PreLoader />
      <div className="d-flex justify-content-center py-3">
        <div
          className=" rounded shadow p-3"
          style={{ backgroundColor: "#ffff" }}
        >
          <div className="border-bottom border-2">
            <h4>Complaint Form for Gender-Based Incidents</h4>
          </div>

          <form
            onSubmit={handleSubmit}
            className="text-start"
            style={{ minHeight: "20rem" }}
          >
            {/* Report Details */}
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
                  type="text"
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
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </Form.Select>
              </div>
            </div>

            {/* Incident Details */}
            <h5 className="my-2">Incident Details</h5>
            <div className="row">
              <div className="col-md input-group mb-1">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Perpetrator's Name(Optional)"
                  name="perpetratorName"
                  value={formData.perpetratorName}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-2">
                <SubjectSelection />
              </div>
            </div>

            <FloatingLabel
              controlId="floatingTextarea2"
              label="Description of the Incident"
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
                <h5 className="my-2">Upload Proof of Incident (optional)</h5>
                {/* Supporting Document Uploads */}
                <div className="d-flex flex-wrap gap-2">
                  {formData.supportingDocuments.map((doc, index) =>
                    doc ? (
                      <div key={index} className="mb-1">
                        <div className="position-relative">
                          <img
                            className="imagePreview"
                            src={doc.preview}
                            alt={`preview ${index}`}
                            style={{ maxWidth: "100%", maxHeight: "100%" }}
                          />
                          <button
                            type="button"
                            className="position-absolute text-light rounded p-0"
                            onClick={() => handleRemoveImage(index)}
                            style={{
                              width: "20px",
                              height: "20px",
                              lineHeight: "20px",
                              textAlign: "center",
                              fontSize: "12px",
                            }}
                          >
                            x
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div key={index}>
                        <label
                          htmlFor={`supportingDocuments_${index}`}
                          className="form-label supportImageContainer position-relative d-flex justify-content-center align-items-center"
                        >
                          <i className="bx bx-image-add bx-md text-secondary"></i>
                        </label>

                        <input
                          hidden
                          id={`supportingDocuments_${index}`}
                          type="file"
                          name={`supportingDocuments_${index}`}
                          className="form-control"
                          onChange={handleChange}
                          accept="image/*"
                        />
                      </div>
                    )
                  )}
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
