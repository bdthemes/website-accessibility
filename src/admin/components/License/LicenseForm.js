import React, { useState } from "react";
import LicenseHeader from "./LicenseHeader";

const LicenseForm = ({
  onActivate,
  isActivating = false,
  errorMessage = "",
  pluginName = "Sigma Store Locator",
  showHeader = true,
}) => {
  const [licenseKey, setLicenseKey] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (licenseKey.trim() && email.trim()) {
      onActivate(licenseKey.trim(), email.trim());
    }
  };

  return (
    <div className="wap-license-card">
      <LicenseHeader
        title={`${pluginName} Licensing`}
        subtitle="Enter your license key to activate and receive updates & premium support."
      />

      {errorMessage && (
        <div className="wap-license-form__error">
          <svg
            className="wap-license-form__error-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="wap-license-form__form">
        <div className="wap-license-form__fields">
          <div className="wap-license-form__field">
            <label htmlFor="license_key">License Code</label>
            <input
              type="text"
              id="license_key"
              className="wap-license-form__input"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="xxxxxxxx-xxxxxxxx-xxxxxxxx-xxxxxxxx"
              required
              disabled={isActivating}
            />
          </div>

          <div className="wap-license-form__field">
            <label htmlFor="license_email">Email Address</label>
            <input
              type="email"
              id="license_email"
              className="wap-license-form__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={isActivating}
            />
            <p className="wap-license-form__hint">
              We will send update news of this product by this email address,
              don't worry, we hate spam
            </p>
          </div>
        </div>

        <div className="wap-license-form__submit-wrap">
          <button
            type="submit"
            disabled={isActivating}
            className="wap-license-form__submit"
          >
            {isActivating ? (
              <>
                <svg
                  className="wap-license-form__submit-spinner"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    style={{ opacity: 0.25 }}
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    style={{ opacity: 0.75 }}
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Activating...
              </>
            ) : (
              "Activate License"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LicenseForm;
