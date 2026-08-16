import { useState, useEffect, useMemo } from "@wordpress/element";

/**
 * Brand helpers.
 *
 * The admin SPA and toolbar read the brand name / logo from the localized
 * `websacAdmin` object. By default that is "One Accessibility"; add-ons that
 * offer white-label branding filter the localized data server-side and fire a
 * `websac-white-label-changed` window event after saving so the UI re-reads it.
 */

export const getWebsacAdmin = () =>
  typeof window !== "undefined" ? window.websacAdmin : null;

const DEFAULT_BRAND = "One Accessibility";

export const getBrandDisplayName = () => {
  const admin = getWebsacAdmin();
  const name = admin?.brandDisplayName;
  if (typeof name === "string" && name.trim() !== "") {
    return name.trim();
  }

  const boot = admin?.whiteLabelBoot;
  if (boot?.enabled && typeof boot.title === "string" && boot.title.trim() !== "") {
    return boot.title.trim();
  }

  return DEFAULT_BRAND;
};

function useBrandEpoch() {
  const [epoch, setEpoch] = useState(0);

  useEffect(() => {
    const onChange = () => setEpoch((n) => n + 1);
    window.addEventListener("websac-white-label-changed", onChange);
    return () => window.removeEventListener("websac-white-label-changed", onChange);
  }, []);

  return epoch;
}

/** React hook — re-reads brand title after an add-on changes branding. */
export function useBrandDisplayName() {
  const epoch = useBrandEpoch();
  return useMemo(() => getBrandDisplayName(), [epoch]);
}

/** Whether custom (white-label) branding is active. */
export function isWhiteLabelBrandingEnabled() {
  const boot = getWebsacAdmin()?.whiteLabelBoot;
  return !!(boot && typeof boot === "object" && boot.enabled);
}

/** React hook — updates when branding changes. */
export function useWhiteLabelBrandingEnabled() {
  const epoch = useBrandEpoch();
  return useMemo(() => isWhiteLabelBrandingEnabled(), [epoch]);
}
