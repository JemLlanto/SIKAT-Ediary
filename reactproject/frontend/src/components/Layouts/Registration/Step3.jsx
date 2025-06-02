import React from "react";

const Step3 = ({ values, handleInput, sendOTP, resendCountdown }) => {
  return (
    <div className="form-section active mb-2">
      <h5>Account Verification</h5>
      {otpSent ? (
        <div>
          <p className="m-0">
            An OTP has been sent to{" "}
            <span className="text-success">{values.cvsuEmail}</span>
          </p>
          <input
            type="number"
            name="OTP"
            placeholder="Enter OTP"
            className="form-control"
            onChange={handleInput}
            value={values.OTP}
          />
          {/* {otpError && <p style={{ color: "red" }}>{otpError}</p>} */}
          <div className="text-end">
            <button
              onClick={(e) => {
                e.preventDefault(); // Prevent form submission when clicking the resend OTP button
                sendOTP(values.cvsuEmail);
              }}
              className="btn btn-link"
              disabled={resendCountdown > 0} // Disable if countdown is active
            >
              <p className="m-0">
                Resend OTP{" "}
                <span>{resendCountdown > 0 && `(${resendCountdown}s)`}</span>
              </p>
            </button>
          </div>
        </div>
      ) : (
        <p>Sending OTP...</p>
      )}
    </div>
  );
};

export default Step3;
