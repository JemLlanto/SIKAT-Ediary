import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import { useState } from "react";

const AnonimityButton = () => {
  const [selectedOption, setSelectedOption] = useState("");

  const handleCheckboxChange = (e) => {
    const { name } = e.target;
    setSelectedOption(name); // Set the selected option, deselecting the other
  };

  return (
    <Dropdown>
      <Dropdown.Toggle
        className="w-100 border border-secondary-subtle"
        variant=""
        id="dropdown-basic"
      >
        Anonimity Setting
      </Dropdown.Toggle>

      <Dropdown.Menu className="w-100 px-2">
        <Form.Check
          type="checkbox"
          id="anonimous"
          label="Anonimous"
          name="anonimous"
          checked={selectedOption === "anonimous"}
          onChange={handleCheckboxChange}
        />
        <Form.Check
          type="checkbox"
          id="notAnonimous"
          label="Not Anonimous"
          name="notAnonimous"
          checked={selectedOption === "notAnonimous"}
          onChange={handleCheckboxChange}
        />

        {/* <button className="orangeButton w-100">Save Settings</button> */}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default AnonimityButton;
