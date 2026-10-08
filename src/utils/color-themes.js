import { __ } from "@wordpress/i18n";
import { toRgb } from "./theme-variables";

export { isHex, themeVariables } from "./theme-variables";

/**
 * Colour themes for a preset (panel.wrapper.theme). A theme is one main colour:
 * picking it fills the toolbar's own colour fields (button, header, footer
 * buttons) and stores the colour with its hover/active shades and the text
 * colour that reads on it. The PHP side (View\Frontend::print_theme_colors)
 * prints those as `--wap-primary*` variables on :root, which the toolbar's
 * accents — and anything an add-on draws on the page — fall back to.
 *
 * Every main colour here keeps white text at 4.5:1 or more (WCAG AA).
 */
export const COLOR_THEMES = [
	{ id: "blue", name: __("Blue", "website-accessibility"), primary: "#1d4ed8" },
	{ id: "indigo", name: __("Indigo", "website-accessibility"), primary: "#4338ca" },
	{ id: "purple", name: __("Purple", "website-accessibility"), primary: "#7e22ce" },
	{ id: "pink", name: __("Pink", "website-accessibility"), primary: "#be185d" },
	{ id: "red", name: __("Red", "website-accessibility"), primary: "#b91c1c" },
	{ id: "orange", name: __("Orange", "website-accessibility"), primary: "#c2410c" },
	{ id: "green", name: __("Green", "website-accessibility"), primary: "#15803d" },
	{ id: "teal", name: __("Teal", "website-accessibility"), primary: "#0f766e" },
	{ id: "dark", name: __("Dark", "website-accessibility"), primary: "#1f2937" },
];

/** The toolbar's colours before themes existed; "Default" puts them back. */
const DEFAULT_COLORS = { button: "#1677ff", header: "#2e6cf6" };

const toHex = (rgb) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
const darken = (hex, amount) => toHex(toRgb(hex).map((v) => v * (1 - amount)));

const luminance = (hex) => {
	const [r, g, b] = toRgb(hex).map((v) => {
		const c = v / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
};

/** A theme from one main colour: its shades and the text colour that reads on it. */
export const buildTheme = (primary, id = "custom") => {
	const color = primary.toLowerCase();
	const onPrimary = contrast(color, "#ffffff") >= 4.5 ? "#ffffff" : "#111111";
	return {
		id,
		primary: color,
		hover: darken(color, 0.12),
		active: darken(color, 0.24),
		onPrimary,
	};
};

const withItemAttributes = (items, slug, update) =>
	(items || []).map((item) => (item.slug === slug ? { ...item, attributes: update({ ...(item.attributes || {}) }) } : item));

/**
 * The preset form data with a theme applied: the theme stored, and the button,
 * header and footer colour fields set from it. `null` restores the defaults.
 * Each field can still be changed on its own afterwards.
 */
export const applyColorTheme = (formData, theme) => {
	const panel = formData?.panel || {};
	const wrapper = { ...(panel.wrapper || {}) };
	const button = { ...(formData?.button || {}) };

	let items;
	if (theme) {
		const iconColor = theme.onPrimary === "#ffffff" ? "#e5e7ea" : "#1f2937";
		wrapper.theme = theme;
		button.bgColor = theme.primary;
		button.color = theme.onPrimary;
		items = withItemAttributes(panel.items, "header", (attributes) => ({
			...attributes,
			background: theme.primary,
			border: `1px solid ${theme.primary}`,
			color: theme.onPrimary,
			iconColor,
		}));
		items = withItemAttributes(items, "footer", (attributes) => ({
			...attributes,
			preferenceSaveBg: theme.primary,
			preferenceSaveColor: theme.onPrimary,
			preferenceSaveBorderColor: theme.primary,
			resetBtnBg: theme.primary,
			resetBtnColor: theme.onPrimary,
		}));
	} else {
		delete wrapper.theme;
		button.bgColor = DEFAULT_COLORS.button;
		button.color = "#ffffff";
		items = withItemAttributes(panel.items, "header", (attributes) => {
			delete attributes.color;
			delete attributes.iconColor;
			return { ...attributes, background: DEFAULT_COLORS.header, border: `1px solid ${DEFAULT_COLORS.header}` };
		});
		items = withItemAttributes(items, "footer", (attributes) => {
			["preferenceSaveBg", "preferenceSaveColor", "preferenceSaveBorderColor", "resetBtnBg", "resetBtnColor"].forEach(
				(key) => delete attributes[key],
			);
			return attributes;
		});
	}

	return { ...formData, button, panel: { ...panel, wrapper, items } };
};
