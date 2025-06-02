import React from "react";
import { CloseButton, Modal } from "react-bootstrap";

const ImageModal = ({ showModal, handleCloseModal, diaryImage }) => {
  return (
    <>
      {/* Modal */}
      <Modal
        className="DiaryImage"
        show={showModal}
        onHide={handleCloseModal}
        centered
        size="lg"
        style={{}}
      >
        <Modal.Body
          className="text-center p-1"
          // style={{ maxHeight: "70vh" }}
        >
          <div style={{ height: "clamp(20rem, 55dvw, 38rem)" }}>
            <img
              src={diaryImage}
              alt="Diary Full View"
              className="rounded position-relative bg-light rounded-0 p-2"
              style={{
                height: "100%",
                width: "100%",
                objectFit: "contain",
              }}
            />
            <div
              className="position-absolute "
              style={{
                right: ".5rem",
                top: ".5rem",
                backgroundColor: "rgb(242, 242, 242,.5)",
                paddingTop: ".15rem",
                paddingLeft: ".15rem",
                paddingRight: ".15rem",
              }}
            >
              <CloseButton onClick={handleCloseModal} style={{}} />
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ImageModal;
