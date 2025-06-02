import React from "react";

const ActivityLogs = () => {
  return (
    <div>
      <div className=" bg-light border border-secondary-subtle rounded shadow  p-2">
        <div className="d-flex justify-content-between border-bottom pt-2 px-2">
          <div>
            <h5>Activity Logs</h5>
          </div>
          <div>
            <p className="orangerText" style={{ cursor: "pointer" }}>
              View All
            </p>
          </div>
        </div>
        <div
          className="pe-1 mt-1"
          style={{ height: "35vh", overflowY: "scroll" }}
        >
          <div className="journalEntries d-flex align-items-start flex-column rounded ps-2 pt-1">
            <p className="text-start m-0 mb-2 mt-1">
              You Replied on Username's Comment.
            </p>
          </div>
          <div className="journalEntries d-flex align-items-start flex-column rounded ps-2 pt-1">
            <p className="text-start m-0 mb-2 mt-1">
              You Gadified Username's Diary.
            </p>
          </div>
          <div className="journalEntries d-flex align-items-start flex-column rounded ps-2 pt-1">
            <p className="text-start m-0 mb-2 mt-1">
              You Commented on Username's Diary.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
