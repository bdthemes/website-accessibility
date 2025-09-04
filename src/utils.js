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
			highlightLinks: "enable",
			biggerText: "medium",
			cursor: "mask",
			pauseAnimations: "enable",
			tooltips: "enable",
			textAlign: "left",
			smartContrast: "enable",
			textSpacing: "medium",
			lineHeight: "medium",
		},
	},
	{
		id: "blind",
		title: { rendered: "Blind", raw: "Blind" },
		slug: "blind",
		icon: <BlindIcon />,
		features: {
			screenReader: "normal",
			biggerText: "large",
			contrast: "invert",
			smartContrast: "enable",
			tooltips: "disable",
			highlightLinks: "disable",
			pauseAnimations: "enable",
			textSpacing: "large",
			lineHeight: "large",
			textAlign: "left",
		},
	},
	{
		id: "color-blind",
		title: { rendered: "Color Blind", raw: "Color Blind" },
		slug: "color-blind",
		icon: <ColorBlindIcon />,
		features: {
			contrast: "dark",
			smartContrast: "enable",
			saturation: "desaturate",
			highlightLinks: "enable",
			dictionary: "enable",
			textAlign: "left",
		},
	},
	{
		id: "dyslexia",
		title: { rendered: "Dyslexia", raw: "Dyslexia" },
		slug: "dyslexia",
		icon: <DyslexiaIcon />,
		features: {
			dyslexiaFriendly: "dyslexia",
			biggerText: "large",
			lineHeight: "large",
			textSpacing: "large",
			highlightLinks: "enable",
			dictionary: "enable",
			tooltips: "enable",
			textAlign: "left",
		},
	},
	{
		id: "low-vision",
		title: { rendered: "Low vision", raw: "Low vision" },
		slug: "low-vision",
		icon: <LowVisionIcon />,
		features: {
			contrast: "light",
			biggerText: "huge",
			lineHeight: "extra-large",
			textSpacing: "extra-large",
			highlightLinks: "enable",
			saturation: "high",
			tooltips: "enable",
			dictionary: "enable",
			pauseAnimations: "enable",
			textAlign: "left",
		},
	},
	{
		id: "cognitive",
		title: { rendered: "Cognitive & Learning", raw: "Cognitive & Learning" },
		slug: "cognitive",
		icon: <CognitiveIcon />,
		features: {
			screenReader: "slow",
			contrast: "light",
			biggerText: "large",
			lineHeight: "large",
			textSpacing: "large",
			tooltips: "enable",
			dictionary: "enable",
			pauseAnimations: "enable",
			textAlign: "left",
		},
	},
	{
		id: "seizure",
		title: { rendered: "Seizure & Epileptic", raw: "Seizure & Epileptic" },
		slug: "seizure",
		icon: <SeizureIcon />,
		features: {
			contrast: "light",
			pauseAnimations: "enable",
			hideImages: "enable",
			saturation: "desaturate",
			screenReader: "disable",
			highlightLinks: "disable",
			tooltips: "disable",
			dictionary: "disable",
			textAlign: "left",
		},
	},
	{
		id: "adhd",
		title: { rendered: "ADHD", raw: "ADHD" },
		slug: "adhd",
		icon: <ADHDIcon />,
		features: {
			pauseAnimations: "enable",
			contrast: "light",
			biggerText: "large",
			lineHeight: "large",
			textSpacing: "large",
			screenReader: "slow",
			dictionary: "enable",
			tooltips: "enable",
			textAlign: "left",
		},
	},
];