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

  const handleToggleChange = async (subject) => {
    const updatedItems = { ...selectedItems };

    if (subject === "General") {
      // If General is being selected, select all filters
      if (!selectedItems["General"]) {
        filterOptions.forEach((filter) => {
          updatedItems[filter.subject] = true;
        });
      } else {
        // If General is being deselected, deselect all filters
        filterOptions.forEach((filter) => {
          updatedItems[filter.subject] = false;
        });
      }
    } else {
      // Toggle individual filter
      updatedItems[subject] = !selectedItems[subject];

      // Check if all filters are selected/deselected to update General accordingly
      const allSelected = filterOptions.every(
        (filter) => filter.subject === "General" || updatedItems[filter.subject]
      );
      updatedItems["General"] = allSelected;
    }

    setSelectedItems(updatedItems);

    const selectedSubjectsText = [];
    filterOptions.forEach((filter) => {
      if (updatedItems[filter.subject]) {
        selectedSubjectsText.push(filter.subject);
      }
    });

    onFilterChange(selectedSubjectsText); // Make sure this gets called with the correct array

    // Update filters in the backend
    try {
      const promises = filterOptions.map(async (filter) => {
        const wasSelected = selectedItems[filter.subject];
        const isSelected = updatedItems[filter.subject];

        if (wasSelected !== isSelected) {
          if (isSelected) {
            await axios.post(`http://localhost:8081/saveUserFilterss`, {
              userID,
              filter: filter.subject,
            });
          } else {
            await axios.delete(`http://localhost:8081/deleteUserFilters`, {
              data: {
                userID,
                filter: filter.subject,
              },
            });
          }
        }
      });

      await Promise.all(promises);
    } catch (err) {
      console.error("Error updating filters:", err);
    }
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
        onClick={() => setDropdownOpen(!dropdownOpen)}
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
          {/* Place General filter at the top */}
          <ToggleButton
            key="General"
            id="toggle-General"
            type="checkbox"
            checked={selectedItems["General"] || false}
            value="General"
            onChange={() => handleToggleChange("General")}
            className="w-100 text-start"
          >
            <p className="m-0">Select All</p>
          </ToggleButton>

          {/* Other filters */}
          {filterOptions
            .filter((filter) => filter.subject !== "General")
            .map((filter) => (
              <ToggleButton
                key={filter.subject}
                id={`toggle-${filter.subject}`}
                type="checkbox"
                checked={selectedItems[filter.subject] || false}
                value={filter.subject}
                onChange={() => handleToggleChange(filter.subject)}
                className="w-100 text-start"
              >
                <p className="m-0">{filter.subject}</p>
              </ToggleButton>
            ))}
        </div>
        {/* <button
          className="w-100 orangeButton py-1 mt-2"
          onClick={handleSaveAndClose}
        >
          Save Filter
        </button> */}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default FilterButton;
