import Dropdown from "react-bootstrap/Dropdown";
import { ToggleButton } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";

const FilterButton = ({ onFilterChange, userID, initialFilters }) => {
  const [selectedItems, setSelectedItems] = useState({});
  const [filterOptions, setFilterOptions] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await axios.get("http://localhost:8081/filters");
        const filters = response.data;

        const initialItems = {};
        filters.forEach((filter) => {
          initialItems[filter.subject] = false;
        });

        setFilterOptions(filters);

        if (userID) {
          const userFiltersResponse = await axios.get(
            `http://localhost:8081/getUserFilters/${userID}`
          );
          const savedFilters = userFiltersResponse.data.filters;

          const updatedItems = { ...initialItems };
          savedFilters.forEach((filter) => {
            if (updatedItems.hasOwnProperty(filter)) {
              updatedItems[filter] = true;
            }
          });

          setSelectedItems(updatedItems);
          onFilterChange(savedFilters);
        }
      } catch (err) {
        console.error("Error fetching filters:", err);
      }
    };

    fetchFilters();
  }, [userID]);

  const handleToggleChange = (subject) => {
    const updatedItems = {
      ...selectedItems,
      [subject]: !selectedItems[subject],
    };

    setSelectedItems(updatedItems);

    const selectedSubjectsText = [];
    filterOptions.forEach((filter) => {
      if (updatedItems[filter.subject]) {
        selectedSubjectsText.push(filter.subject);
      }
    });

    onFilterChange(selectedSubjectsText);

    const updateFilter = async () => {
      try {
        if (updatedItems[subject]) {
          await axios.post(`http://localhost:8081/saveUserFilterss`, {
            userID,
            filter: subject,
          });
        } else {
          await axios.delete(`http://localhost:8081/deleteUserFilters`, {
            data: {
              userID,
              filter: subject,
            },
          });
        }
      } catch (err) {
        console.error("Error");
      }
    };

    updateFilter();
  };

  const handleSaveAndClose = () => {
    setDropdownOpen(false);
  };

  return (
    <Dropdown show={dropdownOpen} onToggle={setDropdownOpen}>
      <Dropdown.Toggle
        className="border-0 d-flex align-items-center ps-0"
        variant=""
        id="dropdown-basic"
        onClick={() => setDropdownOpen(!dropdownOpen)} // Toggle dropdown state
      >
        <h6 className="m-0 d-flex align-items-center gap-1">
          <i className="bx bx-filter-alt"></i> Filter
        </h6>
      </Dropdown.Toggle>

      <Dropdown.Menu
        className="px-2"
        style={{ zIndex: "1000", width: "clamp(13rem, 15dvw, 15rem)" }}
      >
        <div className="fiterToggle d-flex flex-column gap-1">
          {filterOptions.map((filter) => (
            <ToggleButton
              key={filter.subject}
              id={`toggle-${filter.subject}`}
              type="checkbox"
              checked={selectedItems[filter.subject] || false}
              value={filter.subject}
              onChange={() => handleToggleChange(filter.subject)}
              className="w-100 text-start"
            >
              {filter.subject}
            </ToggleButton>
          ))}
        </div>
        <button
          className="w-100 orangeButton py-1 mt-2"
          onClick={handleSaveAndClose}
        >
          Save Filter
        </button>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default FilterButton;
