// InactivityContext.js
import React, { createContext, useState, useEffect } from "react";

export const InactivityContext = createContext();

export const InactivityProvider = ({ children }) => {
  const [isInactive, setIsInactive] = useState(false);

  useEffect(() => {
    let timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsInactive(true);
      }, 30 * 60 * 1000);
    };

    const events = ["mousemove", "keydown", "click"];

    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimeout(timeout);
    };
  }, []);

  return (
    <InactivityContext.Provider value={{ isInactive }}>
      {children}
    </InactivityContext.Provider>
  );
};
