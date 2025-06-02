import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Button from "react-bootstrap/Button";
import Pagination from "react-bootstrap/Pagination";
import axios from "axios";
import sampleImage from "../../../assets/Background.jpg";
import { Dropdown } from "react-bootstrap";
import MessageAlert from "../DiaryEntry/messageAlert";
import MessageModal from "../DiaryEntry/messageModal";

const IndexImage = () => {
  const [images, setImages] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingImage, setEditingImage] = useState(null); // For edit mode
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8081/api/index-images"
      );
      setImages(response.data);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    // Check if file is selected and if its size is greater than 5MB
    if (file && file.size > 5 * 1024 * 1024) {
      alert("File size exceeds the 5MB limit. Please choose a smaller image.");
      setImageFile(null); // Clear the file input
      setImagePreview(null); // Clear the image preview
    } else {
      setImageFile(file);
      if (file) setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title || (!imageFile && !editingImage)) {
      alert("Title and image are required.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (imageFile) formData.append("image", imageFile);

    setLoading(true);

    try {
      if (editingImage) {
        await axios.put(
          `http://localhost:8081/api/index-images/${editingImage.index_imagesID}`,
          { title, description }
        );
        setModal({
          show: true,
          message: `Index image updated successfully.`,
        });
      } else {
        await axios.post("http://localhost:8081/api/index-images", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setModal({
          show: true,
          message: `Index image added successfully.`,
        });
      }

      resetForm();
      fetchImages();
    } catch (error) {
      console.error("Error saving image:", error);
      setModal({
        show: true,
        message: `Failed to save image.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (index_imagesID) => {
    setConfirmModal({
      show: true,
      message: `Are you sure you want to delete this index image?`,
      onConfirm: async () => {
        try {
          await axios.delete(
            `http://localhost:8081/index-images/${index_imagesID}`
          );
          closeConfirmModal();
          setModal({
            show: true,
            message: `Index image deleted successfully.`,
          });
          fetchImages();
        } catch (error) {
          console.error("Error deleting image:", error);
          alert("Failed to delete image.");
        }
      },
      onCancel: () => setConfirmModal({ show: false, message: "" }),
    });
  };

  const handleEdit = (image) => {
    setEditingImage(image);
    setTitle(image.title);
    setDescription(image.description);
    setImagePreview(
      image.image_path ? `http://localhost:8081${image.image_path}` : null
    );
  };

  const resetForm = () => {
    setImageFile(null);
    setImagePreview(null);
    setTitle("");
    setDescription("");
    setEditingImage(null);
  };

  return (
    <div className="p-3 rounded shadow-sm" style={{ backgroundColor: "#fff" }}>
      <MessageAlert
        showModal={modal}
        closeModal={closeModal}
        title={"Notice"}
        message={modal.message}
      ></MessageAlert>
      <MessageModal
        showModal={confirmModal}
        closeModal={closeConfirmModal}
        title={"Confirmation"}
        message={confirmModal.message}
        confirm={confirmModal.onConfirm}
        needConfirm={1}
      ></MessageModal>

      <div className=" position-relative border-bottom d-flex justify-content-center align-items-end pb-2 gap-1">
        <h4 className="border-2 m-0">Index Page Images</h4>
        <div className="informationToolTip">
          <i class="bx bx-info-circle"></i>
          <p className="infToolTip rounded p-2 m-0">
            These images will appear on the website's main page.
          </p>
        </div>
      </div>

      {/* Scrollable Image Section */}
      <div
        className="custom-scrollbar overflow-y-scroll p-3"
        style={{ height: "clamp(15rem, 20dvw, 20rem)" }}
      >
        {images.map((image) => (
          <div
            key={image.index_imagesID}
            className="row d-flex justify-content-center gap-3 mb-3"
          >
            <div
              className="col-md-4 px-0 position-relative"
              style={{
                height: "clamp(7rem, 8dvw, 8rem)",
                width: "clamp(14rem, 15dvw, 16rem)",
              }}
            >
              <img
                src={
                  image && image.image_path
                    ? `http://localhost:8081${image.image_path}`
                    : sampleImage
                }
                alt={image.title}
                className="rounded"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {/* Dropdown for Edit/Save/Delete */}
              <Dropdown
                className="position-absolute"
                style={{ right: ".5rem", top: ".5rem" }}
              >
                <Dropdown.Toggle variant="light" bsPrefix>
                  <h5 className="m-0 d-flex align-items-center">
                    <i className="bx bx-dots-horizontal-rounded"></i>
                  </h5>
                </Dropdown.Toggle>
                {editingImage ? (
                  <Dropdown.Menu>
                    <Dropdown.Item className="btn p-0 px-2" onClick={resetForm}>
                      <button className="btn btn-light w-100">
                        <p className="m-0">Cancel</p>
                      </button>
                    </Dropdown.Item>
                    <Dropdown.Item className="btn p-0 px-2">
                      <button className="btn btn-light w-100">
                        <p className="m-0">Save</p>
                      </button>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                ) : (
                  <Dropdown.Menu>
                    <Dropdown.Item
                      className="btn p-0 px-2"
                      onClick={() => handleEdit(image)}
                    >
                      <button className="btn btn-light w-100">
                        <p className="m-0">Edit</p>
                      </button>
                    </Dropdown.Item>
                    <Dropdown.Item className="btn p-0 px-2">
                      <button
                        className="btn btn-light w-100"
                        onClick={() => handleDelete(image.index_imagesID)}
                      >
                        <p className="m-0">Delete</p>
                      </button>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                )}
              </Dropdown>
            </div>
            <div className="col-md px-0 py-1 text-start d-flex flex-column justify-content-start">
              <div className="d-flex align-items-center align-items-md-start flex-column gap-2">
                <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-1">
                  {/* Title Section */}
                  <h5 className="m-0">{image.title}</h5>
                </div>
                <p className="m-0">{image.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Form onSubmit={handleSubmit}>
        <h5 className="mt-4">
          {editingImage ? "Edit Index Image" : "Add Index Image"}
        </h5>

        <div className="row gap-2 m-auto" style={{ width: "100%" }}>
          {/* Image Upload Section */}
          <div className="col-md-4 px-0 d-flex justify-content-center position-relative">
            {imagePreview ? (
              <div
                className="position-relative"
                style={{
                  height: "clamp(6.7rem, 10dvw, 6.9rem)",
                  width: "clamp(14rem, 19dvw, 20rem)",
                }}
              >
                <img
                  className="rounded"
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <button
                  className="btn btn-danger p-0 px-2 position-absolute"
                  onClick={resetForm} // Remove image preview
                  style={{ right: ".5rem", top: ".5rem" }}
                >
                  <p className="m-0">x</p>
                </button>
              </div>
            ) : (
              <div className="mt-1">
                <label className="w-100" htmlFor="uploadPhoto">
                  <div
                    className="d-flex justify-content-center border rounded py-2 "
                    style={{
                      cursor: "pointer",
                      height: "clamp(6.7rem, 10dvw, 6.9rem)",
                      width: "clamp(14rem, 19dvw, 20rem)",
                    }}
                  >
                    <p className="m-0 d-flex align-items-center gap-1 text-secondary">
                      <i
                        className="bx bx-image-add bx-sm"
                        style={{ color: "var(--primary)" }}
                      ></i>
                      Upload Photo
                    </p>
                  </div>
                </label>
                <input
                  type="file"
                  id="uploadPhoto"
                  hidden
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>

          {/* Title and Description Section */}
          <div className="col-md px-0 py-1 text-start d-flex flex-column justify-content-center">
            <div className="d-flex flex-column gap-2">
              {/* Title Input */}
              <div className="d-flex align-items-center gap-1">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Sample Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)} // Capture Title input
                    aria-label="Title"
                    aria-describedby="basic-addon1"
                  />
                </div>
              </div>

              {/* Description Textarea */}
              <div className="form-floating">
                <textarea
                  className="form-control"
                  placeholder="Short Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)} // Capture Description input
                  id="floatingTextarea"
                ></textarea>
                <label htmlFor="floatingTextarea">Short Description</label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-3 d-flex justify-content-end">
          <button type="submit" className="w-100 primaryButton px-5 py-2">
            <p className="m-0">
              {loading ? "Saving..." : editingImage ? "Update" : "Save"}
            </p>
          </button>
        </div>
      </Form>
    </div>
  );
};

export default IndexImage;
