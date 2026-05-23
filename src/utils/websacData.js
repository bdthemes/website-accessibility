import { useState, useEffect, useMemo } from "@wordpress/element";
import { getWhiteLabelPanelFooterText } from "./whiteLabelPanelIcons";

export const getWebsacAdmin = () =>
  typeof window !== "undefined" ? window.websacAdmin : null;

/** White-label title from PHP bootstrap (`WEBSAC_WHITE_LABEL_BRAND` / saved client title). */
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

  return "One Accessibility";
};

/** React hook — re-reads brand title after white label save (`websac-white-label-changed`). */
export function useBrandDisplayName() {
  const [wlUiEpoch, setWlUiEpoch] = useState(0);

  useEffect(() => {
    const onWlChange = () => setWlUiEpoch((n) => n + 1);
    window.addEventListener("websac-white-label-changed", onWlChange);
    return () => window.removeEventListener("websac-white-label-changed", onWlChange);
  }, []);

  return useMemo(() => getBrandDisplayName(), [wlUiEpoch]);
}

/** Whether white label branding is active (admin + client-facing chrome). */
export function isWhiteLabelBrandingEnabled() {
  const admin = getWebsacAdmin();
  const boot = admin?.whiteLabelBoot;
  if (boot && typeof boot === "object") {
    return !!boot.enabled;
  }
  return false;
}

/** React hook — updates when white label settings are saved. */
export function useWhiteLabelBrandingEnabled() {
  const [wlUiEpoch, setWlUiEpoch] = useState(0);

  useEffect(() => {
    const onWlChange = () => setWlUiEpoch((n) => n + 1);
    window.addEventListener("websac-white-label-changed", onWlChange);
    return () => window.removeEventListener("websac-white-label-changed", onWlChange);
  }, []);

  return useMemo(() => isWhiteLabelBrandingEnabled(), [wlUiEpoch]);
}

const WL_ICON_STYLE_SYNC_ID = "websac-wl-admin-menu-icon-sync";
const WL_ICON_STYLE_PHP_ID = "websac-wl-admin-menu-icon-php";
const WL_ICON_STYLE_FOOTER_ID = "websac-wl-admin-menu-icon-footer";
const WL_HIDE_LICENSE_STYLE_SYNC_ID = "websac-wl-hide-license-submenu-sync";
const WL_HIDE_LICENSE_STYLE_PHP_ID = "websac-wl-hide-license-submenu";

const MENU_ICON_SELECTOR = "#adminmenu .wap-admin-root-menu .wp-menu-image";
const MENU_LINK_SELECTOR = "#adminmenu a.toplevel_page_website-accessibility";

function removeWlAdminMenuIconStyles() {
  if (typeof document === "undefined") {
    return;
  }
  [
    WL_ICON_STYLE_PHP_ID,
    WL_ICON_STYLE_SYNC_ID,
    WL_ICON_STYLE_FOOTER_ID,
  ].forEach((id) => document.getElementById(id)?.remove());
}

function removeWlHideLicenseStyles() {
  if (typeof document === "undefined") {
    return;
  }
  [WL_HIDE_LICENSE_STYLE_PHP_ID, WL_HIDE_LICENSE_STYLE_SYNC_ID].forEach((id) =>
    document.getElementById(id)?.remove()
  );
}

function getMenuIconElement() {
  return document.querySelector(MENU_ICON_SELECTOR);
}

function hasCustomMenuIconArtifacts() {
  if (
    document.getElementById(WL_ICON_STYLE_PHP_ID) ||
    document.getElementById(WL_ICON_STYLE_SYNC_ID) ||
    document.getElementById(WL_ICON_STYLE_FOOTER_ID)
  ) {
    return true;
  }

  const wrap = getMenuIconElement();
  if (!wrap) {
    return false;
  }

  return (
    wrap.classList.contains("websac-wl-has-custom-icon") ||
    !!wrap.style.backgroundImage ||
    !!wrap.querySelector("img[style]")
  );
}

function restoreDefaultMenuIcon() {
  removeWlAdminMenuIconStyles();

  const wrap = getMenuIconElement();
  if (!wrap) {
    return;
  }

  wrap.removeAttribute("style");
  wrap.classList.remove("websac-wl-has-custom-icon");

  const img = wrap.querySelector("img");
  if (img) {
    img.removeAttribute("style");
  }
}

function buildMenuIconCssText(imageUrl) {
  const safe = imageUrl.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `
    ${MENU_ICON_SELECTOR} {
      position: relative !important;
      background-image: url("${safe}") !important;
      background-size: 20px 20px !important;
      background-repeat: no-repeat !important;
      background-position: center center !important;
    }
    ${MENU_ICON_SELECTOR}::before,
    ${MENU_ICON_SELECTOR}::after {
      display: none !important;
      content: none !important;
    }
    ${MENU_ICON_SELECTOR} img {
      opacity: 0 !important;
      visibility: hidden !important;
      width: 0 !important;
      height: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    .folded #adminmenu .wap-admin-root-menu .wp-menu-image {
      background-position: center center !important;
    }
  `;
}

function applyCustomMenuIcon(imageUrl) {
  removeWlAdminMenuIconStyles();

  const wrap = getMenuIconElement();
  if (wrap) {
    wrap.classList.add("websac-wl-has-custom-icon");
    wrap.style.backgroundImage = `url("${imageUrl}")`;
    wrap.style.backgroundSize = "20px 20px";
    wrap.style.backgroundRepeat = "no-repeat";
    wrap.style.backgroundPosition = "center center";
    const img = wrap.querySelector("img");
    if (img) {
      img.style.opacity = "0";
      img.style.visibility = "hidden";
      img.style.width = "0";
      img.style.height = "0";
    }
  }

  const el = document.createElement("style");
  el.id = WL_ICON_STYLE_SYNC_ID;
  el.textContent = buildMenuIconCssText(imageUrl);
  document.head.appendChild(el);
}

function syncMenuIcon(imageUrl, { forceRestore = false } = {}) {
  if (imageUrl) {
    applyCustomMenuIcon(imageUrl);
    return;
  }

  if (forceRestore || hasCustomMenuIconArtifacts()) {
    restoreDefaultMenuIcon();
  }
}

function syncHideLicenseSubmenu(hide, isRecovery) {
  removeWlHideLicenseStyles();
  if (!hide || isRecovery) {
    return;
  }
  const el = document.createElement("style");
  el.id = WL_HIDE_LICENSE_STYLE_SYNC_ID;
  el.textContent =
    '#adminmenu a[href*="page=website-accessibility-license"] { display: none !important; }';
  document.head.appendChild(el);
}

function setMenuLiHidden(selector, hidden) {
  const anchor = document.querySelector(selector);
  const li = anchor?.closest("li");
  if (!li) {
    return;
  }
  li.style.display = hidden ? "none" : "";
}

function syncDocumentTitle(title, baseBrand) {
  if (typeof document === "undefined" || !document.title || !title || !baseBrand) {
    return;
  }
  if (document.title.includes(baseBrand)) {
    document.title = document.title.split(baseBrand).join(title);
  }
}

function applyTopLevelMenuLabel(title) {
  const topLevelA = document.querySelector(MENU_LINK_SELECTOR);
  if (!topLevelA) {
    return;
  }
  const label = topLevelA.querySelector(".wp-menu-name");
  if (label) {
    label.textContent = title;
  }
  topLevelA.setAttribute("aria-label", title);
}

/**
 * Normalize REST save/GET payload into a consistent WL state object.
 *
 * @param {Record<string, unknown>} source Raw API or form payload.
 * @returns {Record<string, unknown>}
 */
export function normalizeWhiteLabelState(source) {
  if (!source || typeof source !== "object") {
    return { enabled: false };
  }
  return {
    enabled: !!source.enabled,
    hide_license: !!source.hide_license,
    hide_admin: !!source.hide_admin,
    title: typeof source.title === "string" ? source.title : "",
    icon: typeof source.icon === "string" ? source.icon : "",
    logo: typeof source.logo === "string" ? source.logo : "",
    panel_header_icon:
      typeof source.panel_header_icon === "string" ? source.panel_header_icon : "",
    panel_footer_icon:
      typeof source.panel_footer_icon === "string" ? source.panel_footer_icon : "",
    panel_footer_text:
      typeof source.panel_footer_text === "string" ? source.panel_footer_text : "",
  };
}

/**
 * Update wp-admin left menu after white label REST save (no full reload).
 *
 * @param {Record<string, unknown>} wl Payload from GET /white-label.
 * @param {{ forceIconRestore?: boolean }} [options]
 */
export function syncWhiteLabelWpAdminMenu(wl, options = {}) {
  if (typeof document === "undefined") {
    return;
  }

  const state = normalizeWhiteLabelState(wl);
  const data = window.websacAdmin;
  const baseBrand =
    (typeof data?.defaultBrandDisplayName === "string" &&
      data.defaultBrandDisplayName.trim()) ||
    "One Accessibility";

  const isRecovery = !!data?.whiteLabelRecovery;
  syncHideLicenseSubmenu(state.hide_license && state.enabled, isRecovery);

  if (!state.enabled) {
    applyTopLevelMenuLabel(baseBrand);
    syncDocumentTitle(baseBrand, baseBrand);
    setMenuLiHidden("a.toplevel_page_website-accessibility", false);
    syncMenuIcon("", { forceRestore: true });
    return;
  }

  const title =
    typeof state.title === "string" && state.title.trim() !== ""
      ? state.title.trim()
      : baseBrand;

  applyTopLevelMenuLabel(title);
  syncDocumentTitle(title, baseBrand);
  setMenuLiHidden("a.toplevel_page_website-accessibility", !!state.hide_admin);

  const icon = typeof state.icon === "string" ? state.icon.trim() : "";
  syncMenuIcon(icon, { forceRestore: !!options.forceIconRestore });
}

/**
 * Run once on plugin admin boot so menu/header match saved WL without requiring save again.
 */
export function bootWhiteLabelAdminChrome() {
  const admin = getWebsacAdmin();
  const boot = admin?.whiteLabelBoot;
  if (!boot || typeof boot !== "object") {
    return;
  }

  const run = () => syncWhiteLabelWpAdminMenu(boot);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
    return;
  }

  run();
}

/**
 * Mirror PHP option state into window.websacAdmin after REST save.
 *
 * @param {Record<string, unknown>} wl Payload from GET /white-label (e.g. save response `settings`).
 */
export function applyWhiteLabelClientPatch(wl) {
  if (typeof window === "undefined" || !window.websacAdmin || !wl || typeof wl !== "object") {
    return;
  }

  const state = normalizeWhiteLabelState(wl);
  const base =
    (typeof window.websacAdmin.defaultBrandDisplayName === "string" &&
      window.websacAdmin.defaultBrandDisplayName.trim()) ||
    "One Accessibility";

  if (!window.websacAdmin.whiteLabelBoot || typeof window.websacAdmin.whiteLabelBoot !== "object") {
    window.websacAdmin.whiteLabelBoot = {};
  }

  if (!state.enabled) {
    window.websacAdmin.brandDisplayName = base;
    window.websacAdmin.brandLogoUrl = "";
    window.websacAdmin.hideLicenseNav = false;
    window.websacAdmin.whiteLabelFooterHidden = false;
    window.websacAdmin.whiteLabelBoot = {
      enabled: false,
      hide_license: false,
      hide_admin: false,
      title: "",
      icon: "",
      logo: "",
      panel_header_icon: "",
      panel_footer_icon: "",
      panel_footer_text: "",
    };
  } else {
    const title = state.title.trim();
    window.websacAdmin.brandDisplayName = title || base;
    window.websacAdmin.brandLogoUrl = state.logo.trim();
    window.websacAdmin.hideLicenseNav = !!state.hide_license;
    window.websacAdmin.whiteLabelFooterHidden = true;
    window.websacAdmin.whiteLabelBoot = {
      ...state,
      panel_header_icon:
        typeof state.panel_header_icon === "string" ? state.panel_header_icon : "",
      panel_footer_icon:
        typeof state.panel_footer_icon === "string" ? state.panel_footer_icon : "",
      panel_footer_text:
        typeof state.panel_footer_text === "string" ? state.panel_footer_text : "",
    };
  }

  syncWhiteLabelWpAdminMenu(state, { forceIconRestore: true });

  if (window.websiteAccessibility && typeof window.websiteAccessibility === "object") {
    window.websiteAccessibility.brandDisplayName = window.websacAdmin.brandDisplayName;
    window.websiteAccessibility.whiteLabelEnabled = !!state.enabled;
    window.websiteAccessibility.whiteLabelBoot = window.websacAdmin.whiteLabelBoot;
    window.websiteAccessibility.panelFooterText = getWhiteLabelPanelFooterText(
      window.websacAdmin.brandDisplayName
    );
  }

  window.requestAnimationFrame(() => {
    syncWhiteLabelWpAdminMenu(state, { forceIconRestore: true });
  });

  window.dispatchEvent(new CustomEvent("websac-white-label-changed"));
}
