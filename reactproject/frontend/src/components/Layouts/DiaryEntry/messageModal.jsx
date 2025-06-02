import React from "react";
import { Button, Modal } from "react-bootstrap";

const MessageModal = ({
  showModal,
  closeModal,
  title,
  message,
  confirm,
  needConfirm,
}) => {
  return (
    <>
      {/* Modal */}
      <Modal show={showModal.show} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 className="m-0">{title}</h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>{" "}
        <Modal.Footer>
          {needConfirm ? (
            <>
              <Button className="py-2" variant="secondary" onClick={closeModal}>
                <p className="m-0">Cancel</p>
              </Button>
              <button className="primaryButton py-2 rounded" onClick={confirm}>
                <p className="m-0">Confirm</p>
              </button>
            </>
          ) : (
            <button className="primaryButton py-2" onClick={closeModal}>
              Close
            </button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MessageModal;
