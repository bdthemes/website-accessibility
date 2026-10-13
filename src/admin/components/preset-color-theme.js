import { __, sprintf } from "@wordpress/i18n";
import { useSelect, useDispatch } from "@wordpress/data";
import { STORE_NAME } from "../store";
import ColorPicker from "../controls/color-picker";
import { COLOR_THEMES, applyColorTheme, buildTheme } from "../../utils/color-themes";

// #abc → #aabbcc; anything else that is not #rrggbb → "".
const toSixDigitHex = (value) => {
	const hex = String(value || "").trim().toLowerCase();
	if (/^#[0-9a-f]{6}$/.test(hex)) return hex;
	if (/^#[0-9a-f]{3}$/.test(hex)) return `#${[...hex.slice(1)].map((c) => c + c).join("")}`;
	return "";
};

const CheckIcon = ({ color }) => (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
		<path d="m5 12.5 4.5 4.5L19 7.5" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

/**
 * One click to recolour the whole toolbar: launcher button, header, the
 * accents of active tools and profiles, and the footer buttons. Add-ons that
 * draw on the page (e.g. an accessibility checker) can follow the same colour
 * through the `--wap-primary` variables.
 */
const PresetColorTheme = () => {
	const { WapCard } = window?.wapComponents;
	const { presetsFormData } = useSelect((select) => select(STORE_NAME).getPresetsFormData(), []);
	const { setPresetsFormData } = useDispatch(STORE_NAME);
	const current = presetsFormData?.panel?.wrapper?.theme || null;

	const pick = (theme) => setPresetsFormData(applyColorTheme(presetsFormData, theme));

	return (
		<WapCard bordered={false} className="wap-panel-right-sidebar__card wap-color-theme">
			<p className="wap-color-theme__note">
				{__("Pick a color to apply it to the button, header, active tools and footer buttons at once. You can still change any of them below.", "website-accessibility")}
			</p>
			<div className="wap-color-theme__swatches" role="group" aria-label={__("Color theme", "website-accessibility")}>
				<button
					type="button"
					className={`wap-color-theme__swatch wap-color-theme__swatch--default${!current ? " is-active" : ""}`}
					aria-pressed={!current}
					onClick={() => pick(null)}
				>
					<span className="wap-color-theme__dot" style={{ "--wap-theme-swatch": "#1677ff" }}>
						{!current && <CheckIcon color="#ffffff" />}
					</span>
					<span className="wap-color-theme__name">{__("Default", "website-accessibility")}</span>
				</button>
				{COLOR_THEMES.map((theme) => {
					const active = current?.id === theme.id;
					return (
						<button
							type="button"
							key={theme.id}
							className={`wap-color-theme__swatch${active ? " is-active" : ""}`}
							aria-pressed={active}
							onClick={() => pick(buildTheme(theme.primary, theme.id))}
						>
							<span className="wap-color-theme__dot" style={{ "--wap-theme-swatch": theme.primary }}>
								{active && <CheckIcon color="#ffffff" />}
							</span>
							<span className="wap-color-theme__name">{theme.name}</span>
						</button>
					);
				})}
			</div>
			<div className={`wap-color-theme__custom${current?.id === "custom" ? " is-active" : ""}`}>
				<span className="wap-color-theme__custom-label">
					{current?.id === "custom"
						? sprintf(
								/* translators: %s: colour code, e.g. #1677ff. */
								__("Custom color %s", "website-accessibility"),
								current.primary,
						  )
						: __("Custom color", "website-accessibility")}
				</span>
				<ColorPicker
					value={current?.id === "custom" ? current.primary : ""}
					onChange={(value) => {
						const hex = toSixDigitHex(value);
						if (hex) pick(buildTheme(hex, "custom"));
					}}
				/>
			</div>
		</WapCard>
	);
};

export default PresetColorTheme;
