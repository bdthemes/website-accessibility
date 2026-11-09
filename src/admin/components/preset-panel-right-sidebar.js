import { __ } from "@wordpress/i18n";
import ControlWrapper from "./control-wrapper";
import ColorPicker from "../controls/color-picker";
import SpacingInput from "../controls/spacing-input";
import { usePresetPanelWrapper } from "./preset-panel-wrapper-utils";
import {
	PANEL_WIDTH_MIN,
	PANEL_WIDTH_MAX,
	PANEL_WIDTH_DEFAULT,
	PANEL_MAX_HEIGHT_MIN,
	PANEL_MAX_HEIGHT_MAX,
	PANEL_MAX_HEIGHT_DEFAULT,
	clampPanelWidth,
	clampPanelMaxHeight,
} from "../../utils/preset-dimensions";

const PresetPanelRightSidebar = () => {
	const { WapSelect, WapInput, WapCard } = window?.wapComponents;
	const { wrapper, handleWrapperChange } = usePresetPanelWrapper();

	return (
		<div className="wap-panel-right-sidebar">
			<WapCard bordered={false} className="wap-panel-right-sidebar__card" title={__("Panel", "website-accessibility")}>
				<div className="wap-panel-right-sidebar__layout-grid">
					<ControlWrapper label={__("Side", "website-accessibility")}>
						<WapSelect
							value={wrapper.position || "right"}
							onChange={(value) => handleWrapperChange("position", value)}
						>
							<WapSelect.Option value="left">{__("Left Side", "website-accessibility")}</WapSelect.Option>
							<WapSelect.Option value="right">{__("Right Side", "website-accessibility")}</WapSelect.Option>
						</WapSelect>
					</ControlWrapper>
					<ControlWrapper label={__("Width", "website-accessibility")}>
						<WapInput
							type="number"
							min={PANEL_WIDTH_MIN}
							max={PANEL_WIDTH_MAX}
							value={wrapper.width ?? PANEL_WIDTH_DEFAULT}
							onChange={(e) => handleWrapperChange("width", e.target.value)}
							// Clamp only a value the user edited: tabbing through must not rewrite a
							// stored legacy value (e.g. max height 605) and flag the form as changed.
							onFocus={(e) => { e.target.dataset.focusValue = e.target.value; }}
							onBlur={(e) => { if (e.target.value !== e.target.dataset.focusValue) handleWrapperChange("width", String(clampPanelWidth(e.target.value))); }}
							addonAfter="px"
						/>
					</ControlWrapper>
					<ControlWrapper label={__("Max height", "website-accessibility")}>
						<WapInput
							type="number"
							min={PANEL_MAX_HEIGHT_MIN}
							max={PANEL_MAX_HEIGHT_MAX}
							value={wrapper.maxHeight > PANEL_MAX_HEIGHT_MAX ? PANEL_MAX_HEIGHT_DEFAULT : (wrapper.maxHeight ?? PANEL_MAX_HEIGHT_DEFAULT)}
							onChange={(e) => handleWrapperChange("maxHeight", e.target.value)}
							onFocus={(e) => { e.target.dataset.focusValue = e.target.value; }}
							onBlur={(e) => { if (e.target.value !== e.target.dataset.focusValue) handleWrapperChange("maxHeight", String(clampPanelMaxHeight(e.target.value))); }}
							addonAfter="vh"
						/>
					</ControlWrapper>
					<ControlWrapper label={__("Background", "website-accessibility")}>
						<ColorPicker
							value={wrapper.background}
							onChange={(value) => handleWrapperChange("background", value)}
						/>
					</ControlWrapper>
					<ControlWrapper label={__("Padding", "website-accessibility")}>
						<SpacingInput
							value={wrapper.padding || ""}
							onChange={(nextValue) => handleWrapperChange("padding", nextValue)}
							placeholder="20"
						/>
					</ControlWrapper>
				</div>
			</WapCard>
		</div>
	);
};

export default PresetPanelRightSidebar;
