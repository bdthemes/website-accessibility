/**
 * Limits for the preset's size and position fields, shared by the editor
 * (clamped when a field loses focus) and everything that renders the toolbar
 * (clamped again on use, for presets saved before these limits or edited by
 * hand). PHP mirrors the offset rule in View\Frontend::launcher_parts().
 */
export const PANEL_WIDTH_MIN = 280;
export const PANEL_WIDTH_MAX = 800;
export const PANEL_WIDTH_DEFAULT = 450;
export const PANEL_MAX_HEIGHT_MIN = 30;
export const PANEL_MAX_HEIGHT_MAX = 100;
export const PANEL_MAX_HEIGHT_DEFAULT = 90;
export const BUTTON_OFFSET_MIN = 0;
export const BUTTON_OFFSET_MAX = 200;

const isBlank = (raw) => raw === undefined || raw === null || raw === '';

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

/** Panel width in px: 280–800, blank/invalid → 450. */
export function clampPanelWidth(raw) {
	if (isBlank(raw)) return PANEL_WIDTH_DEFAULT;
	const n = Number(raw);
	if (!Number.isFinite(n) || n <= 0) return PANEL_WIDTH_DEFAULT;
	return Math.round(clamp(n, PANEL_WIDTH_MIN, PANEL_WIDTH_MAX));
}

/**
 * Panel max height in vh: 30–100. Blank, invalid, ≤ 0 or a legacy value above
 * 100 (stored when the field was in px) mean the default 90.
 */
export function clampPanelMaxHeight(raw) {
	if (isBlank(raw)) return PANEL_MAX_HEIGHT_DEFAULT;
	const n = Number(raw);
	if (!Number.isFinite(n) || n <= 0 || n > PANEL_MAX_HEIGHT_MAX) return PANEL_MAX_HEIGHT_DEFAULT;
	return Math.round(clamp(n, PANEL_MAX_HEIGHT_MIN, PANEL_MAX_HEIGHT_MAX));
}

/** Button offset in px: 0–200, or null when blank/invalid (use the CSS default). */
export function clampButtonOffset(raw) {
	if (isBlank(raw)) return null;
	const n = Number(raw);
	if (!Number.isFinite(n)) return null;
	return Math.round(clamp(n, BUTTON_OFFSET_MIN, BUTTON_OFFSET_MAX));
}

/** CSS value for --button-offset-x/y: "0px" for 0, "" for blank. */
export function buttonOffsetCss(raw) {
	const n = clampButtonOffset(raw);
	return n === null ? '' : `${n}px`;
}
