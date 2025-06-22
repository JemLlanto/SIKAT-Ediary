import { useState, useEffect } from "react";
import { Accordion } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const RecentJournalEntries = ({
  isAdmin,
  entries,
  ownProfile,
  loadingEntries,
}) => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const loadingEntry = Array(6).fill(null); // Creates an array of 5 null values

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <div className="d-lg-none">
        <Accordion>
          <Accordion.Item eventKey="diaryEntries">
            <Accordion.Header>
              <div className="d-flex align-items-center gap-1">
                <i className="bx bx-edit"></i>
                <h5 className="m-0">Diary entries</h5>
              </div>
            </Accordion.Header>
            <Accordion.Body className="p-0 border-top">
              {loadingEntries ? (
                <>
                  {loadingEntry.map((_, index) => (
                    <div
                      key={index}
                      className="d-flex align-items-start flex-column rounded mt-1"
                    >
                      <h6
                        style={{
                          height: "20px",
                          width: "80%",
                          backgroundColor: "lightgray",
                          marginBottom: "10px", // Optional, adds space between divs
                        }}
                      ></h6>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {error ? (
                    <div>
                      <p>{error}</p>
                    </div>
                  ) : entries.length === 0 ? (
                    <div>
                      <p>No entries available.</p>
                    </div>
                  ) : (
                    <div
                      className="my-1 px-2 custom-scrollbar"
                      style={{ eight: "35vh", overflowY: "scroll" }}
                    >
                      {entries
                        .filter((entry) => {
                          const now = new Date();
                          const scheduledDate = new Date(entry.scheduledDate);
                          const dateToBePosted = new Date();
                          return scheduledDate < dateToBePosted;
                        })
                        .map((entry, index) => {
                          if (
                            !isAdmin &&
                            !ownProfile &&
                            entry.anonimity === "private"
                          ) {
                            return null;
                          }
                          return (
                            <>
                              {!ownProfile &&
                              entry.visibility === "private" ? null : (
                                <Link
                                  key={index}
                                  to={`/DiaryEntry/${entry.entryID}`}
                                  className="rounded text-decoration-none"
                                >
                                  <div className="journalEntries d-flex flex-column rounded ps-1 mt-1">
                                    <div>
                                      <div className="d-flex flex-column align-items-start p-1">
                                        <p className="m-0 text-start text-secondary">
                                          {entry.title}{" "}
                                          <span>
                                            {entry.visibility === "private" ? (
                                              <i className="bx bx-lock-alt"></i>
                                            ) : (
                                              <i className="bx bx-globe"></i>
                                            )}
                                            {entry.anonimity === "private" ? (
                                              <>
                                                <i className="bx bxs-user position-relative">
                                                  <i
                                                    className="bx bx-question-mark position-absolute"
                                                    style={{
                                                      left: ".5rem",
                                                      fontSize:
                                                        "clamp(0.6rem, 1.5dvw, 0.7rem)",
                                                    }}
                                                  ></i>
                                                </i>
                                              </>
                                            ) : null}
                                          </span>
                                        </p>
                                        <span
                                          className="text-secondary"
                                          style={{
                                            fontSize:
                                              "clamp(0.6rem, 1.5dvw, 0.7rem)",
                                          }}
                                        >
                                          {formatDate(entry.created_at)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              )}
                            </>
                          );
                        })}
                    </div>
                  )}
                </>
              )}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
      <div className=" p-2 text-secondary d-none d-lg-block">
        <div className="d-flex justify-content-between border-bottom border-secondary-subtle px-1 pb-2">
          <div className="d-flex align-items-center text-secondary gap-1">
            <i className="bx bx-edit bx-sm"></i>
            <h5 className="m-0 text-start">Diary Entries</h5>
          </div>
          {ownProfile ? (
            <Link to="/DiaryEntries" className="linkText rounded p-1">
              <p className="m-0">View All</p>
            </Link>
          ) : (
            <div></div>
          )}
        </div>
        {loadingEntries ? (
          <>
            {loadingEntry.map((_, index) => (
              <div
                key={index}
                className="d-flex align-items-start flex-column rounded my-2"
              >
                <h6
                  style={{
                    height: "20px",
                    width: "80%",
                    backgroundColor: "lightgray",
                    marginBottom: "10px", // Optional, adds space between divs
                  }}
                ></h6>
              </div>
            ))}
          </>
        ) : (
          <>
            {error ? (
              <div>
                <p>{error}</p>
              </div>
            ) : entries.length === 0 ? (
              <div>
                <p>No entries available.</p>
              </div>
            ) : (
              <div
                className="my-1 px-2 custom-scrollbar"
                style={{ eight: "35vh", overflowY: "scroll" }}
              >
                {entries
                  .filter((entry) => {
                    const now = new Date();
                    const scheduledDate = new Date(entry.scheduledDate);
                    const dateToBePosted = new Date();
                    return scheduledDate < dateToBePosted;
                  })
                  .map((entry, index) => {
                    if (
                      !isAdmin &&
                      !ownProfile &&
                      entry.anonimity === "private"
                    ) {
                      return null;
                    }
                    return (
                      <>
                        {!ownProfile &&
                        entry.visibility === "private" ? null : (
                          <Link
                            key={index}
                            to={`/DiaryEntry/${entry.entryID}`}
                            className="rounded text-decoration-none"
                          >
                            <div className="journalEntries d-flex flex-column rounded ps-1 mt-1">
                              <div>
                                <div className="d-flex flex-column align-items-start p-1">
                                  <p className="m-0 text-start text-secondary">
                                    {entry.title}{" "}
                                    <span>
                                      {entry.visibility === "private" ? (
                                        <i className="bx bx-lock-alt"></i>
                                      ) : (
                                        <i className="bx bx-globe"></i>
                                      )}
                                      {entry.anonimity === "private" ? (
                                        <>
                                          <i className="bx bxs-user position-relative">
                                            <i
                                              className="bx bx-question-mark position-absolute"
                                              style={{
                                                left: ".5rem",
                                                fontSize:
                                                  "clamp(0.6rem, 1.5dvw, 0.7rem)",
                                              }}
                                            ></i>
                                          </i>
                                        </>
                                      ) : null}
                                    </span>
                                  </p>
                                  <span
                                    className="text-secondary"
                                    style={{
                                      fontSize: "clamp(0.6rem, 1.5dvw, 0.7rem)",
                                    }}
                                  >
                                    {formatDate(entry.created_at)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        )}
                      </>
                    );
                  })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RecentJournalEntries;
