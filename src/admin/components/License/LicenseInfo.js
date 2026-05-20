import React from "react";
import { __, sprintf } from "@wordpress/i18n";
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
    <div className="wap-license-card">
      <LicenseHeader
        title={sprintf(__("%s License Info", "website-accessibility"), pluginName)}
        subtitle="Your license is active. View details and manage your subscription below."
      />
      <div className="wap-license-info__body">
        {/* Status */}
        <div className="wap-license-info__row">
          <span className="wap-license-info__label">Status</span>
          {is_valid ? (
            <span className="wap-license-info__badge wap-license-info__badge--valid">
              <svg
                className="wap-license-info__badge-icon"
                xmlns="http://www.w3.org/2000/svg"
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
            <span className="wap-license-info__badge wap-license-info__badge--invalid">
              Invalid
            </span>
          )}
        </div>

        {/* License Type */}
        <div className="wap-license-info__row">
          <span className="wap-license-info__label">License Type</span>
          <span className="wap-license-info__value">{license_title}</span>
        </div>

        {/* License Expiry */}
        <div className="wap-license-info__row">
          <span className="wap-license-info__label">License Expired on</span>
          <div className="wap-license-info__expiry-row">
            <span
              className={
                isExpiringSoon(expire_date)
                  ? "wap-license-info__value wap-license-info__value--expiring"
                  : "wap-license-info__value"
              }
            >
              {expire_date}
            </span>
            {expire_renew_link && (
              <a
                href={expire_renew_link}
                target="_blank"
                rel="noopener noreferrer"
                className="wap-license-info__renew-link"
              >
                Renew License
              </a>
            )}
          </div>
        </div>

        {/* Support Expiry */}
        <div className="wap-license-info__row">
          <span className="wap-license-info__label">Support Expired on</span>
          <div className="wap-license-info__expiry-row">
            <span
              className={
                isExpiringSoon(support_end)
                  ? "wap-license-info__value wap-license-info__value--expiring"
                  : "wap-license-info__value"
              }
            >
              {support_end}
            </span>
            {support_renew_link && (
              <a
                href={support_renew_link}
                target="_blank"
                rel="noopener noreferrer"
                className="wap-license-info__renew-link"
              >
                Renew Support
              </a>
            )}
          </div>
        </div>

        {/* License Key */}
        <div className="wap-license-info__row">
          <span className="wap-license-info__label">Your License Key</span>
          <code className="wap-license-info__key">
            {maskLicenseKey(license_key)}
          </code>
        </div>
      </div>

      {/* Actions */}
      <div className="wap-license-info__actions">
        <button
          type="button"
          onClick={onDeactivate}
          disabled={isDeactivating}
          className="wap-license-info__btn"
        >
          {isDeactivating ? (
            <>
              <svg
                className="wap-license-info__btn-spinner"
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
