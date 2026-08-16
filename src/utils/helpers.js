import features from "./features";
import panelItems from "./panel-items";
import defaultProfiles from "./profiles";
import { getCookie, setCookie, removeCookie } from "./cookie-manager";
import useBrowserKey from "./use-browser-key";
import useDrawerScrollControl from "./use-drawer-scroll-control";
import { DEFAULT_FEATURE_CATEGORY_DEFINITIONS } from "./feature-categories";
import { registerFeatureHandler, getFeatureHandler } from "./feature-handlers";
import { isSvgFile, readSvgFileAsMarkup, svgMarkupToDataUri, extractSvgMarkupFromText, isSvgAssetUrl } from "./svgUpload";

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
