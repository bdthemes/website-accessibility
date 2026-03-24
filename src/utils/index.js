import { __ } from "@wordpress/i18n";
import GetStartedPreset from "../admin/components/preset-get-started";
import PanelCustomizationPreset from "../admin/components/preset-panel-customization";
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

export const locationOptions = [
    {
        label: __("Entire Site", "website-accessibility"),
        value: "entire_site",
        description: __(
            "Apply to all pages of your website",
            "website-accessibility",
        ),
    },
    {
        label: __("Singular", "website-accessibility"),
        value: "singular",
        description: __(
            "Apply to individual posts and pages",
            "website-accessibility",
        ),
    },
    {
        label: __("Archive", "website-accessibility"),
        value: "archive",
        description: __(
            "Apply to archive pages and listings",
            "website-accessibility",
        ),
    },
];

export const steps = [
    {
        title: __("Get Started", "website-accessibility"),
        fields: ["title", "condition", "active"],
        content: GetStartedPreset,
    },
    {
        title: __("Customization", "website-accessibility"),
        fields: [],
        content: PanelCustomizationPreset,
    },
];

export const archivePages = [
    { label: "Home", value: "home" },
    { label: "Blog / Posts Archive", value: "posts" },
    { label: "Category Archive", value: "category" },
    { label: "Tag Archive", value: "tag" },
    { label: "Author Archive", value: "author" },
    { label: "Date Archive", value: "date" },
    { label: "Search Results Page", value: "search" },
    { label: "404 Page", value: "404" },
    { label: "Attachment Page", value: "attachment" },
];

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