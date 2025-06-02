import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import { useState } from "react";

const FilterButton = ({ onFilterChange }) => {
  const [selectedItems, setSelectedItems] = useState({
    all: false,
    sexualHarassment: false,
    domesticAbuse: false,
    genderRelated: false,
  });

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

    // Convert the selected items to a descriptive text format
    const selectedSubjectsText = [];
    if (updatedItems.sexualHarassment)
      selectedSubjectsText.push("Sexual Harassment");
    if (updatedItems.domesticAbuse) selectedSubjectsText.push("Domestic Abuse");
    if (updatedItems.genderRelated) selectedSubjectsText.push("Gender Related");

    // Send the descriptive text to the parent component
    onFilterChange(selectedSubjectsText);
  };

  const applyFilters = () => {
    const selectedFilters = [];
    if (selectedItems.sexualHarassment)
      selectedFilters.push("Sexual Harassment");
    if (selectedItems.domesticAbuse) selectedFilters.push("Domestic Abuse");
    if (selectedItems.genderRelated) selectedFilters.push("Gender Related");

    console.log("Selected Filters:", JSON.stringify(selectedFilters, null, 2));

    onFilterChange(selectedFilters); // This will now pass the array of selected filters
  };

  return (
    <Dropdown>
      <Dropdown.Toggle className="border-0" variant="" id="dropdown-basic">
        Filter
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
        <button className="orangeButton w-100" onClick={applyFilters}>
          Save Filter
        </button>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default FilterButton;
