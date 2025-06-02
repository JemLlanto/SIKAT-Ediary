import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import { useState } from "react";

const SubjectSelection = ({ onSubjectsChange }) => {
  const [selectedItems, setSelectedItems] = useState({
    all: false,
    sexualHarassment: false,
    domesticAbuse: false,
    genderRelated: false,
  });

  const [customReason, setCustomReason] = useState(""); // State for custom input

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;

    let updatedItems;
    if (name === "all") {
      updatedItems = {
        all: checked,
        sexualHarassment: checked,
        domesticAbuse: checked,
        genderRelated: checked,
      };
    } else {
      updatedItems = { ...selectedItems, [name]: checked };
      updatedItems.all =
        updatedItems.sexualHarassment &&
        updatedItems.domesticAbuse &&
        updatedItems.genderRelated;
    }

    setSelectedItems(updatedItems);

    // Convert the selected subjects to a text format
    const selectedSubjectsText = [];
    if (updatedItems.sexualHarassment)
      selectedSubjectsText.push("Sexual Harassment");
    if (updatedItems.domesticAbuse) selectedSubjectsText.push("Domestic Abuse");
    if (updatedItems.genderRelated) selectedSubjectsText.push("Gender Related");

    // Include the custom reason if provided
    if (customReason) selectedSubjectsText.push(customReason);

    // Send the comma-separated string of selected subjects to the parent
    onSubjectsChange(selectedSubjectsText.join(", "));
  };

  const handleCustomReasonChange = (event) => {
    setCustomReason(event.target.value);
  };

  const handleSaveFilter = () => {
    // Create the selected subjects string for saving
    const selectedSubjectsText = [];
    if (selectedItems.sexualHarassment)
      selectedSubjectsText.push("Sexual Harassment");
    if (selectedItems.domesticAbuse)
      selectedSubjectsText.push("Domestic Abuse");
    if (selectedItems.genderRelated)
      selectedSubjectsText.push("Gender Related");

    // Include the custom reason if provided
    if (customReason) selectedSubjectsText.push(customReason);

    // Send the comma-separated string of selected subjects to the parent
    onSubjectsChange(selectedSubjectsText.join(", "));
  };

  return (
    <Dropdown>
      <Dropdown.Toggle className="border-0" variant="" id="dropdown-basic">
        Subject
      </Dropdown.Toggle>

      <Dropdown.Menu className="px-2">
        <Form.Check
          type="checkbox"
          id="all"
          label="All"
          name="all"
          checked={selectedItems.all}
          onChange={handleCheckboxChange}
        />
        <Form.Check
          type="checkbox"
          id="sexualHarassment"
          label="Sexual Harassment"
          name="sexualHarassment"
          checked={selectedItems.sexualHarassment}
          onChange={handleCheckboxChange}
        />
        <Form.Check
          type="checkbox"
          id="domesticAbuse"
          label="Domestic Abuse"
          name="domesticAbuse"
          checked={selectedItems.domesticAbuse}
          onChange={handleCheckboxChange}
        />
        <Form.Check
          type="checkbox"
          id="genderRelated"
          label="Gender Related"
          name="genderRelated"
          checked={selectedItems.genderRelated}
          onChange={handleCheckboxChange}
        />
        <Form.Group className="mt-2">
          <Form.Label>Other Reason</Form.Label>
          <Form.Control
            type="text"
            placeholder="Type other reasons here..."
            value={customReason}
            onChange={handleCustomReasonChange}
          />
        </Form.Group>
        <button
          className="orangeButton w-100"
          onClick={handleSaveFilter} // Update the button's onClick handler
        >
          Save Filter
        </button>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default SubjectSelection;
