import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

function ReportDiaryButton() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [selectedBehavior, setSelectedBehavior] = useState("");

  const handleSelectionChange = (event) => {
    setSelectedBehavior(event.target.value);
  };

  return (
    <>
      <button className="btn btn-light w-100 m-0 " onClick={handleShow}>
        Report
      </button>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Report UserName's Diary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label htmlFor="behavior">Select a behavior: </label>
            <select
              id="behavior"
              value={selectedBehavior}
              onChange={handleSelectionChange}
            >
              <option value="" disabled>
                Select an option
              </option>
              <option value="bullying">Bullying</option>
              <option value="harassment">Harassment</option>
              <option value="pretending">Pretending to be someone</option>
            </select>

            {selectedBehavior && <p>You selected: {selectedBehavior}</p>}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ReportDiaryButton;
