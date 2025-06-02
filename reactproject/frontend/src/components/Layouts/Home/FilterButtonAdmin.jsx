import Dropdown from "react-bootstrap/Dropdown";
import { ToggleButton } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";

const FilterButtonAdmin = ({ onFilterChange, userID }) => {
  const [selectedItems, setSelectedItems] = useState({});
  const [filterOptions, setFilterOptions] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await axios.get("http://localhost:8081/adminFilters");
        const filters = response.data;

        const initialItems = {};
        filters.forEach((filter) => {
          initialItems[filter.adminFilterSubject] = false;
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

  const handleToggleChange = async (adminFilterSubject) => {
    const updatedItems = { ...selectedItems };

    if (adminFilterSubject === "General") {
      if (!selectedItems["General"]) {
        filterOptions.forEach((filter) => {
          updatedItems[filter.adminFilterSubject] = true;
        });
      } else {
        filterOptions.forEach((filter) => {
          updatedItems[filter.adminFilterSubject] = false;
        });
      }
    } else {
      updatedItems[adminFilterSubject] = !selectedItems[adminFilterSubject];

      const allSelected = filterOptions.every(
        (filter) =>
          filter.adminFilterSubject === "General" ||
          updatedItems[filter.adminFilterSubject]
      );
      updatedItems["General"] = allSelected;
    }

    setSelectedItems(updatedItems);

    const selectedadminFilterSubjectsText = [];
    filterOptions.forEach((filter) => {
      if (updatedItems[filter.adminFilterSubject]) {
        selectedadminFilterSubjectsText.push(filter.adminFilterSubject);
      }
    });

    onFilterChange(selectedadminFilterSubjectsText);

    // Update filters in the backend
    try {
      const promises = filterOptions.map(async (filter) => {
        const wasSelected = selectedItems[filter.adminFilterSubject];
        const isSelected = updatedItems[filter.adminFilterSubject];

        if (wasSelected !== isSelected) {
          if (isSelected) {
            await axios.post(`http://localhost:8081/saveUserFilterss`, {
              userID,
              filter: filter.adminFilterSubject,
            });
          } else {
            await axios.delete(`http://localhost:8081/deleteUserFilters`, {
              data: {
                userID,
                filter: filter.adminFilterSubject,
              },
            });
          }
        }
      });

      await Promise.all(promises);
    } catch (err) {
      console.error("Error updating filters:", err);
    }

    setHasChanges(true); // Mark that there are changes
  };

  const handleSaveAndClose = () => {
    setDropdownOpen(false);
  };

  return (
    <Dropdown
      show={dropdownOpen}
      onToggle={setDropdownOpen}
      style={{ zIndex: "50" }}
    >
      <Dropdown.Toggle
        className="border-0 d-flex align-items-center ps-0"
        variant=""
        id="dropdown-basic"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <h6 className="m-0 d-flex align-items-center gap-1">
          <i className="bx bx-filter-alt"></i> Filter{" "}
          {Object.values(selectedItems).some((isSelected) => isSelected) > 0 ? (
            <>(on)</>
          ) : (
            <>(off)</>
          )}
        </h6>
      </Dropdown.Toggle>

      <Dropdown.Menu
        className="px-2"
        style={{ zIndex: "1000", width: "clamp(13rem, 15dvw, 15rem)" }}
      >
        <div className="fiterToggle d-flex flex-column gap-1">
          <ToggleButton
            key="General"
            id="toggle-General"
            type="checkbox"
            checked={selectedItems["General"] || false}
            value="General"
            onChange={() => handleToggleChange("General")}
            className="w-100 text-start"
            aria-checked={selectedItems["General"] || false}
            aria-label="Toggle General filter"
          >
            <p className="m-0">Select All</p>
          </ToggleButton>

          {filterOptions
            .filter((filter) => filter.adminFilterSubject !== "General")
            .map((filter) => (
              <ToggleButton
                key={filter.adminFilterSubject}
                id={`toggle-${filter.adminFilterSubject}`}
                type="checkbox"
                checked={selectedItems[filter.adminFilterSubject] || false}
                value={filter.adminFilterSubject}
                onChange={() => handleToggleChange(filter.adminFilterSubject)}
                className="w-100 text-start"
                aria-checked={selectedItems[filter.adminFilterSubject] || false}
                aria-label={`Toggle ${filter.adminFilterSubject} filter`}
              >
                <p className="m-0">{filter.adminFilterSubject}</p>
              </ToggleButton>
            ))}
        </div>
        {/* <button
          className="w-100 orangeButton py-1 mt-2"
          onClick={handleSaveAndClose}
          disabled={!hasChanges}
        >
          Save Filter
        </button> */}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default FilterButtonAdmin;
