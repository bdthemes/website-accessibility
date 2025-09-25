import { __ } from "@wordpress/i18n";
import GetStartedPreset from "./admin/components/preset-get-started";
import ButtonStylePreset from "./admin/components/preset-button-style";
import PanelCustomizationPreset from "./admin/components/preset-panel-customization";
import {
	MotorIcon,
	BlindIcon,
	ColorBlindIcon,
	DyslexiaIcon,
	LowVisionIcon,
	CognitiveIcon,
	SeizureIcon,
	ADHDIcon,
} from "./assets/profiles-icons";

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
		title: __("Button Style", "website-accessibility"),
		fields: [],
		content: ButtonStylePreset,
	},
	{
		title: __("Panel Customization", "website-accessibility"),
		fields: [],
		content: PanelCustomizationPreset,
	},
];

export const defaultProfiles = [
	{
		id: "motor",
		title: { rendered: "Motor Impaired", raw: "Motor Impaired" },
		slug: "motor",
		icon: <MotorIcon />,
		features: {
			tooltips: "enable",
		},
	},
	{
		id: "blind",
		title: { rendered: "Blind", raw: "Blind" },
		slug: "blind",
		icon: <BlindIcon />,
		features: {
			screenReader: "normal",
		},
	},
	{
		id: "color-blind",
		title: { rendered: "Color Blind", raw: "Color Blind" },
		slug: "color-blind",
		icon: <ColorBlindIcon />,
		features: {
			smartContrast: "enable",
			saturation: "high",
		},
	},
	{
		id: "dyslexia",
		title: { rendered: "Dyslexia", raw: "Dyslexia" },
		slug: "dyslexia",
		icon: <DyslexiaIcon />,
		features: {
			dyslexiaFriendly: "dyslexia",
		},
	},
	{
		id: "low-vision",
		title: { rendered: "Low vision", raw: "Low vision" },
		slug: "low-vision",
		icon: <LowVisionIcon />,
		features: {
			biggerText: "medium",
			cursor: "big-cursor",
			tooltips: "enable",
			saturation: "high",
		},
	},
	{
		id: "cognitive",
		title: { rendered: "Cognitive & Learning", raw: "Cognitive & Learning" },
		slug: "cognitive",
		icon: <CognitiveIcon />,
		features: {
			smartContrast: "enable",
			biggerText: "medium",
			cursor: "guideline",
			tooltips: "enable"
		},
	},
	{
		id: "seizure",
		title: { rendered: "Seizure & Epileptic", raw: "Seizure & Epileptic" },
		slug: "seizure",
		icon: <SeizureIcon />,
		features: {
			saturation: "low",
		},
	},
	{
		id: "adhd",
		title: { rendered: "ADHD", raw: "ADHD" },
		slug: "adhd",
		icon: <ADHDIcon />,
		features: {
			cursor: "mask",
			saturation: "low",
		},
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