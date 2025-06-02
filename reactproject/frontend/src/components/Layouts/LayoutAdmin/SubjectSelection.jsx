import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import { useState } from "react";

const SubjectSelection = () => {
  const [selectedItems, setSelectedItems] = useState({
    all: false,
    sexualHarassment: false,
    domesticAbuse: false,
    genderRelated: false,
  });

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;

    if (name === "all") {
      // When "All" is selected, check or uncheck all other options
      setSelectedItems({
        all: checked,
        sexualHarassment: checked,
        domesticAbuse: checked,
        genderRelated: checked,
      });
    } else {
      // Handle individual selections
      setSelectedItems((prevState) => {
        const updatedItems = { ...prevState, [name]: checked };

        // If all other checkboxes are selected, check "All"
        const allSelected =
          updatedItems.sexualHarassment &&
          updatedItems.domesticAbuse &&
          updatedItems.genderRelated;

        return { ...updatedItems, all: allSelected };
      });
    }
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
        <button className="orangeButton w-100">Save Filter</button>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default SubjectSelection;
