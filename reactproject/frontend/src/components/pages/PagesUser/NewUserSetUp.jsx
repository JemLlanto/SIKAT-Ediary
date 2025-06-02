import React, { useState, useEffect } from "react";
import { Modal, ToggleButton, ButtonGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";

const NewUserSetUp = ({ user }) => {
  // FOR STEP 1
  const [showSetUp, setShowSetUp] = useState(true);
  const handleCloseSetup = () => {
    setShowSetUp(false);
  };

  // FOR STEP 2
  const [showProfileSetUp, setShowProfileSetUp] = useState(true);
  const handleCloseProfileSetUp = () => {
    setShowProfileSetUp(false);
    window.location.reload();
  };

  const [filterSubjects, setFilterSubjects] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});

  useEffect(() => {
    const fetchFilterSubjects = async () => {
      try {
        const response = await axios.get("http://localhost:8081/filters");
        const subjects = response.data;

        const initialState = subjects.reduce((acc, subject) => {
          acc[subject.subject] = false;
          return acc;
        }, {});
        setSelectedItems(initialState);
        setFilterSubjects(subjects);
      } catch (error) {
        console.error("Error fetching filter subjects:", error);
      }
    };

    fetchFilterSubjects();
  }, []);

  const handleToggleChange = (subject) => {
    if (subject === "General") {
      const isGeneralSelected = !selectedItems[subject];
      const updatedState = Object.keys(selectedItems).reduce((acc, key) => {
        acc[key] = isGeneralSelected;
        return acc;
      }, {});
      setSelectedItems(updatedState);
    } else {
      setSelectedItems((prevSelectedItems) => ({
        ...prevSelectedItems,
        [subject]: !prevSelectedItems[subject],
      }));
    }
  };

  const handleSaveFilters = async () => {
    const selectedFilters = Object.keys(selectedItems).filter(
      (filter) => selectedItems[filter]
    );

    if (selectedFilters.length > 0) {
      try {
        await axios.post("http://localhost:8081/saveUserFilters", {
          userID: user.userID,
          filters: selectedFilters,
        });
        console.log("Filters saved successfully");
      } catch (error) {
        console.error("Error saving filters:", error);
      }
    } else {
      console.log("No filters selected.");
    }
  };

  const [step, setStep] = useState(1);
  const handleNextStep = async (userID) => {
    try {
      await axios.put("http://localhost:8081/isNewAccount", {
        userID,
      });
    } catch (error) {
      console.error("Error updating reviewed:", error);
    }
    if (step === 1) {
      handleCloseSetup();
    }
    setTimeout(() => {
      setStep((prevStep) => prevStep + 1);
    }, 500);
  };

  return (
    <>
      {step === 1 && (
        <Modal
          show={showSetUp}
          onHide={handleCloseSetup}
          backdrop={"static"}
          keyboard={false}
          centered
        >
          <Modal.Header>
            <Modal.Title>
              <h4 className="m-0">Welcome, {user.firstName}!</h4>

              <p className="m-0 text-secondary fw-light">
                We're thrilled to have you on Sikat eDiary! To get started,
                please choose the diary subjects you'd like to see in your feed.
                Let's make it truly yours!
              </p>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="fiterToggle d-flex flex-wrap justify-content-center gap-2">
              {filterSubjects.map((subject) => (
                <ToggleButton
                  key={subject.subject}
                  id={`toggle-${subject.subject}`}
                  type="checkbox"
                  variant="outline-primary"
                  checked={selectedItems[subject.subject] || false}
                  value={subject.subject}
                  onChange={() => handleToggleChange(subject.subject)}
                >
                  {subject.subject}
                </ToggleButton>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button
              className="primaryButton py-2 rounded"
              onClick={() => {
                handleSaveFilters();
                handleNextStep(user.userID);
              }}
            >
              <p className="m-0">Save</p>{" "}
            </button>
          </Modal.Footer>
        </Modal>
      )}

      {step === 2 && (
        <Modal
          show={showProfileSetUp}
          onHide={handleCloseProfileSetUp}
          backdrop={"static"}
          keyboard={false}
          centered
        >
          <Modal.Header>
            <Modal.Title>
              <h4 className="m-0">Almost there!</h4>
              <p className="m-0 text-secondary fw-light"></p>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="m-0">
              Would you like to customize your profile first?
            </p>
          </Modal.Body>
          <Modal.Footer>
            <button
              className="btn btn-secondary py-2"
              onClick={handleCloseProfileSetUp}
            >
              <p className="m-0">No</p>{" "}
            </button>
            <Link
              to={`/Profile/${user.userID}`}
              className="primaryButton py-2 rounded text-decoration-none"
            >
              <p className="m-0">Yes</p>{" "}
            </Link>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default NewUserSetUp;
