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
    <div className="bg-white border border-gray-100 rounded-lg">
      <LicenseHeader
        title={`${pluginName} Licensing`}
        subtitle="Enter your license key to activate and receive updates & premium support."
      />

      {errorMessage && (
        <div className="mx-8 mt-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flex-shrink-0 mt-0.5"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p className="text-sm m-0">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          <div>
            <label
              htmlFor="license_key"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              License Code
            </label>
            <input
              type="text"
              id="license_key"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all smm-input-global"
              placeholder="xxxxxxxx-xxxxxxxx-xxxxxxxx-xxxxxxxx"
              required
              disabled={isActivating}
            />
          </div>

          <div>
            <label
              htmlFor="license_email"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="license_email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all smm-input-global"
              placeholder="your@email.com"
              required
              disabled={isActivating}
            />
            <p className="mt-2 text-xs text-gray-500">
              We will send update news of this product by this email address,
              don't worry, we hate spam
            </p>
          </div>
        </div>

        <div className="mt-5">
          <button
            type="submit"
            disabled={isActivating}
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-900 hover:bg-teal-950 disabled:bg-gray-400 text-white font-semibold rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            {isActivating ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
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
