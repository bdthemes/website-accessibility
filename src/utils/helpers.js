import features from "./features";
import panelItems from "./panel-items";
import isScreenReaderActive from "./is-screenreader-active";
import defaultProfiles from "./profiles";
import { getCookie, setCookie, removeCookie } from "./cookie-manager";
import useBrowserKey from "./use-browser-key";
import useDrawerScrollControl from "./use-drawer-scroll-control";

export const getSiteLanguage = () => {
    const siteLanguage = window?.websiteAccessibility?.siteLanguage || "en-US";
    return siteLanguage.split("-")[0];
};

export const helpers = {
    features,
    panelItems,
    isScreenReaderActive,
    defaultProfiles,
    getCookie,
    setCookie,
    removeCookie,
    useBrowserKey,
    useDrawerScrollControl,
};
