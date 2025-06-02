import { React, useState } from "react";
import { Modal, CloseButton } from "react-bootstrap";
import { Link } from "react-router-dom";

export const SuspensionModal = ({ name, isAdmin }) => {
  const [showSuspendModal, setShowSuspendModal] = useState(true);

  const handleShowSuspendModal = () => setShowSuspendModal(true);
  const handleCloseSuspendModal = () => setShowSuspendModal(false);
  return (
    <div>
      <Modal
        className="text-center"
        show={showSuspendModal}
        onHide={handleCloseSuspendModal}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton={isAdmin ? true : false}>
          <Modal.Title className="w-100 ">
            <h2 className="text-center m-0 d-flex align-items-center justify-content-center gap-2">
              <i class="bx bx-error text-danger"></i>
              Account Suspended <i class="bx bx-error text-danger"></i>
            </h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3 d-flex flex-column gap-3">
          <p className="m-0">
            {name} is suspended for violating community standards.
          </p>
          <Link to="/Home">
            <button className="primaryButton w-100 py-2">
              Back to Home Page
            </button>
          </Link>
        </Modal.Body>
      </Modal>
    </div>
  );
};
