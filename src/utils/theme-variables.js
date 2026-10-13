/**
 * CSS variables for a preset's colour theme (panel.wrapper.theme, see
 * color-themes.js) — the same names View\Frontend::print_theme_colors() prints
 * on :root. Kept apart from the theme list so the toolbar bundle stays small.
 */
export const isHex = (value) => /^#[0-9a-f]{6}$/i.test(String(value || ""));

export const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

export const themeVariables = (theme) => {
	if (!isHex(theme?.primary)) return {};
	return {
		"--wap-primary": theme.primary,
		"--wap-primary-rgb": toRgb(theme.primary).join(", "),
		"--wap-primary-hover": isHex(theme.hover) ? theme.hover : theme.primary,
		"--wap-primary-active": isHex(theme.active) ? theme.active : theme.primary,
		"--wap-on-primary": isHex(theme.onPrimary) ? theme.onPrimary : "#ffffff",
	};
};
