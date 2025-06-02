import React from "react";

const FiledCases = () => {
  return (
    <div>
      <div className=" bg-light border border-secondary-subtle rounded shadow  p-2">
        <div className="d-flex justify-content-between border-bottom pt-2 px-1">
          <div>
            <h5>Filed Cases</h5>
          </div>
          <div>
            <p className="orangerText" style={{ cursor: "pointer" }}>
              View All
            </p>
          </div>
        </div>
        <div
          className="pe-1 mt-1"
          style={{ height: "43vh", overflowY: "scroll" }}
        >
          <div className="journalEntries d-flex align-items-start flex-column rounded ps-2 pt-1">
            <h6 className="text-start">Filed Case Subject (Status)</h6>
            <p className="text-start">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni
              expedita repellat quos quod nulla omnis!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiledCases;
