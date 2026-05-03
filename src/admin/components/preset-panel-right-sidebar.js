import { __ } from "@wordpress/i18n";
import ControlWrapper from "./control-wrapper";
import ColorPicker from "../controls/color-picker";
import { usePresetPanelWrapper } from "./preset-panel-wrapper-utils";

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
							min={200}
							max={1000}
							value={wrapper.width || 420}
							onChange={(e) => handleWrapperChange("width", e.target.value)}
							addonAfter="px"
						/>
					</ControlWrapper>
					<ControlWrapper label={__("Max height", "website-accessibility")}>
						<WapInput
							type="number"
							min={10}
							max={100}
							value={wrapper.maxHeight > 100 ? 80 : (wrapper.maxHeight ?? 80)}
							onChange={(e) => handleWrapperChange("maxHeight", e.target.value)}
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
						<WapInput
							value={wrapper.padding || ""}
							onChange={(e) => handleWrapperChange("padding", e.target.value)}
							placeholder="e.g., 20px"
						/>
					</ControlWrapper>
				</div>
			</WapCard>
		</div>
	);
};

export default PresetPanelRightSidebar;
