import { useState, useEffect } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import axios from "axios";

const EditSubjectSelection = ({ onSubjectsChange }) => {
  const [selectedItems, setSelectedItems] = useState({});
  const [customReason, setCustomReason] = useState(""); // State for custom input
  const [dropdownOpen, setDropdownOpen] = useState(false); // State to manage dropdown open/close
  const [filterSubjects, setFilterSubjects] = useState([]); // State for fetched filter subjects

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

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;

    let updatedItems;
    if (name === "all") {
      updatedItems = filterSubjects.reduce((acc, subject) => {
        acc[subject.subject] = checked;
        return acc;
      }, {});
      updatedItems.all = checked;
    } else {
      updatedItems = { ...selectedItems, [name]: checked };
    }

    setSelectedItems(updatedItems);

    const selectedSubjectsText = [];
    filterSubjects.forEach((subject) => {
      if (updatedItems[subject.subject])
        selectedSubjectsText.push(subject.subject);
    });

    if (updatedItems.other && customReason)
      selectedSubjectsText.push(customReason);

    // If there are no subjects selected, pass null
    if (selectedSubjectsText.length > 0) {
      onSubjectsChange(selectedSubjectsText.join(", "));
    } else {
      onSubjectsChange(null); // Set to null if no subject is selected
    }
  };

  const handleCustomReasonChange = (event) => {
    setCustomReason(event.target.value);
  };

  const handleSaveFilter = () => {
    const selectedSubjectsText = [];
    filterSubjects.forEach((subject) => {
      if (selectedItems[subject.subject])
        selectedSubjectsText.push(subject.subject);
    });

    if (selectedItems.other && customReason)
      selectedSubjectsText.push(customReason);

    // If there are no subjects selected, pass null
    if (selectedSubjectsText.length > 0) {
      onSubjectsChange(selectedSubjectsText.join(", "));
    } else {
      onSubjectsChange(null); // Set to null if no subject is selected
    }
    setDropdownOpen(false);
  };

  return (
    <Dropdown show={dropdownOpen} onToggle={setDropdownOpen}>
      <Dropdown.Toggle
        className="w-100 border d-flex align-items-center disabled"
        variant=""
        id="dropdown-basic"
      >
        <p className="m-0">Subject/Topic</p>
      </Dropdown.Toggle>

      <Dropdown.Menu className="px-2">
        {filterSubjects.length > 0 && (
          <>
            {/* <Form.Check
              type="checkbox"
              id="none"
              label="None(If subject is N/A)"
              name="none"
              checked="{selectedItems.all}"
              onChange={handleCheckboxChange}
            /> */}
            {filterSubjects.map((subject) => (
              <Form.Check
                key={subject.subjectID}
                type="checkbox"
                id={`edit-
                  ${subject.subject}`}
                label={subject.subject}
                name={subject.subject}
                checked={selectedItems[subject.subject] || false}
                onChange={handleCheckboxChange}
                style={{ width: "clamp(13rem, 10dvw, 18rem)" }}
              />
            ))}

            {/* <button className="orangeButton w-100" onClick={handleSaveFilter}>
              Save Filter
            </button> */}
          </>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default EditSubjectSelection;
