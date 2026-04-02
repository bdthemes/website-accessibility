import React, { useState, useEffect } from "react";
import LicenseForm from "./LicenseForm";
import LicenseInfo from "./LicenseInfo";
import LoadingSpinner from "./LoadingSpinner";
import { licenseService } from "./API/license";

const LicenseManager = ({
  pluginName = "Sigma Store Locator",
  onLicenseChange = null,
  showHeader = true,
  containerClassName = "",
}) => {
  const [licenseState, setLicenseState] = useState({
    isActive: false,
    licenseData: null,
    errorMessage: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const notify = (type, message) => {
    const WapMessage = window?.wapComponents?.WapMessage;
    if (WapMessage && typeof WapMessage[type] === "function") {
      WapMessage[type](message);
      return;
    }
    if (type === "error") {
      // eslint-disable-next-line no-alert
      alert(message);
    }
  };

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const data = await licenseService.checkLicenseStatus();
      const isActive = data?.is_active || false;
      setLicenseState({
        isActive,
        licenseData: data?.license_data || null,
        errorMessage: data?.error_message || "",
      });

      if (!window.websacPro) {
        window.websacPro = {};
      }
      window.websacPro.isProActive = isActive;
      window.dispatchEvent(
        new CustomEvent("websac-license-changed", {
          detail: { isLicenseValid: isActive },
        })
      );

      if (onLicenseChange) {
        onLicenseChange(isActive, data?.license_data || null);
      }
    } catch (e) {
      setLicenseState((prev) => ({
        ...prev,
        errorMessage: e?.message || "Failed to check license status",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleActivate = (licenseKey, email) => {
    setIsActivating(true);
    setLicenseState((prev) => ({ ...prev, errorMessage: "" }));
    licenseService
      .activateLicense(licenseKey, email)
      .then((data) => {
        if (data?.success) {
          notify("success", "License activated successfully!");
          fetchStatus();
          return;
        }
        const msg = data?.message || "Failed to activate license";
        notify("error", msg);
        setLicenseState((prev) => ({ ...prev, errorMessage: msg }));
      })
      .catch((error) => {
        const msg = error?.message || "Error activating license";
        notify("error", msg);
        setLicenseState((prev) => ({ ...prev, errorMessage: msg }));
      })
      .finally(() => {
        setIsActivating(false);
      });
  };

  const handleDeactivate = () => {
    if (window.confirm("Are you sure you want to deactivate this license?")) {
      setIsDeactivating(true);
      licenseService
        .deactivateLicense()
        .then((data) => {
          if (data?.success) {
            notify("success", "License deactivated successfully!");
            fetchStatus();
            return;
          }
          notify("error", data?.message || "Failed to deactivate license");
        })
        .catch((error) => {
          notify("error", error?.message || "Error deactivating license");
        })
        .finally(() => {
          setIsDeactivating(false);
        });
    }
  };

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center min-h-[400px] ${containerClassName}`}
      >
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      {licenseState.isActive ? (
        <LicenseInfo
          licenseData={licenseState.licenseData}
          onDeactivate={handleDeactivate}
          isDeactivating={isDeactivating}
          pluginName={pluginName}
          showHeader={showHeader}
        />
      ) : (
        <LicenseForm
          onActivate={handleActivate}
          isActivating={isActivating}
          errorMessage={licenseState.errorMessage}
          pluginName={pluginName}
          showHeader={showHeader}
        />
      )}
    </div>
  );
};

export default LicenseManager;
