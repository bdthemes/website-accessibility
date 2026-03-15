import React from "react";
import LicenseHeader from "./LicenseHeader";

const LicenseInfo = ({
  licenseData,
  onDeactivate,
  isDeactivating = false,
  pluginName = "Sigma Store Locator",
  showHeader = true,
}) => {
  if (!licenseData) {
    return null;
  }

  const {
    is_valid = false,
    license_title = "N/A",
    expire_date = "N/A",
    support_end = "N/A",
    license_key = "",
    expire_renew_link = "",
    support_renew_link = "",
  } = licenseData;

  const maskLicenseKey = (key) => {
    if (!key || key.length < 18) return key;
    return `${key.substring(0, 9)}XXXXXXXX-XXXXXXXX${key.substring(
      key.length - 9,
    )}`;
  };

  const isExpiringSoon = (dateStr) => {
    if (
      !dateStr ||
      dateStr.toLowerCase() === "unlimited" ||
      dateStr.toLowerCase() === "no expiry"
    ) {
      return false;
    }
    try {
      const expiryDate = new Date(dateStr);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiryDate < thirtyDaysFromNow;
    } catch {
      return false;
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-lg">
      {/* {showHeader && ( */}

      <LicenseHeader
        title={`${pluginName} License Info`}
        subtitle="Your license is active. View details and manage your subscription below."
      />
      {/* // )} */}
      <div className="p-6 space-y-4">
        {/* Status */}
        <div className="pb-6 border-b border-gray-100">
          <span className="block mb-2 text-sm font-medium text-gray-700">
            Status
          </span>
          {is_valid ? (
            <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Valid
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-lg">
              Invalid
            </span>
          )}
        </div>

        {/* License Type */}
        <div className="pb-6 border-b border-gray-100">
          <span className="block mb-2 text-sm font-medium text-gray-700">
            License Type
          </span>
          <span className="text-sm text-gray-900">{license_title}</span>
        </div>

        {/* License Expiry */}
        <div className="pb-6 border-b border-gray-100">
          <span className="block mb-2 text-sm font-medium text-gray-700">
            License Expired on
          </span>
          <div className="flex items-center gap-3">
            <span
              className={`text-sm ${
                isExpiringSoon(expire_date)
                  ? "text-orange-600 font-medium"
                  : "text-gray-900"
              }`}
            >
              {expire_date}
            </span>
            {expire_renew_link && (
              <a
                href={expire_renew_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-teal-900 hover:text-teal-950 hover:underline"
              >
                Renew License
              </a>
            )}
          </div>
        </div>

        {/* Support Expiry */}
        <div className="pb-6 border-b border-gray-100">
          <span className="block mb-2 text-sm font-medium text-gray-700">
            Support Expired on
          </span>
          <div className="flex items-center gap-3">
            <span
              className={`text-sm ${
                isExpiringSoon(support_end)
                  ? "text-orange-600 font-medium"
                  : "text-gray-900"
              }`}
            >
              {support_end}
            </span>
            {support_renew_link && (
              <a
                href={support_renew_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-teal-900 hover:text-teal-950 hover:underline"
              >
                Renew Support
              </a>
            )}
          </div>
        </div>

        {/* License Key */}
        <div>
          <span className="block mb-2 text-sm font-medium text-gray-700">
            Your License Key
          </span>
          <code className="inline-block px-3 py-2 text-sm font-mono font-semibold text-gray-700 bg-gray-100 border border-gray-100 rounded-lg">
            {maskLicenseKey(license_key)}
          </code>
        </div>
      </div>

      {/* Actions */}
      <div className=" p-6">
        <button
          type="button"
          onClick={onDeactivate}
          disabled={isDeactivating}
          className="min-w-[140px] px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium border border-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isDeactivating ? (
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
              Deactivating...
            </>
          ) : (
            "Deactivate License"
          )}
        </button>
      </div>
    </div>
  );
};

export default LicenseInfo;
