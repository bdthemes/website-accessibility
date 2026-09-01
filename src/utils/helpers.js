import features from "./features";
import panelItems from "./panel-items";
import defaultProfiles from "./profiles";
import { getCookie, setCookie, removeCookie } from "./cookie-manager";
import useBrowserKey from "./use-browser-key";
import useDrawerScrollControl from "./use-drawer-scroll-control";
import { DEFAULT_FEATURE_CATEGORY_DEFINITIONS } from "./feature-categories";
import { registerFeatureHandler, getFeatureHandler } from "./feature-handlers";
import { isSvgFile, readSvgFileAsMarkup, svgMarkupToDataUri, extractSvgMarkupFromText, isSvgAssetUrl } from "./svgUpload";

/**
 * Turn a stored length into a usable CSS value.
 *
 * Fields like Border Radius now hold a bare number (the "px" is shown as an
 * input addon instead of being typed), but presets saved before that still hold
 * strings such as "6px" or "50%". Both have to keep working.
 *
 * @param {string|number} value
 * @return {string|undefined} A CSS length, or undefined when there is nothing set.
 */
export const toCssLength = (value) => {
    if (value === null || value === undefined) return undefined;

    const raw = String(value).trim();
    if (raw === '') return undefined;

    // A bare number means the unit lives in the UI, so add it back.
    return /^-?\d*\.?\d+$/.test(raw) ? `${raw}px` : raw;
};

export const getSiteLanguage = () => {
    const siteLanguage = window?.websiteAccessibility?.siteLanguage || "en-US";
    return siteLanguage.split("-")[0];
};

export const helpers = {
    features,
    panelItems,
    registerFeatureHandler,
    getFeatureHandler,
    defaultProfiles,
    getCookie,
    setCookie,
    removeCookie,
    useBrowserKey,
    useDrawerScrollControl,
    featureCategoryDefinitions: DEFAULT_FEATURE_CATEGORY_DEFINITIONS,
    svgUpload: { isSvgFile, readSvgFileAsMarkup, svgMarkupToDataUri, extractSvgMarkupFromText, isSvgAssetUrl },
};
