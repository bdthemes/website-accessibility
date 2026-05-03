import { __ } from "@wordpress/i18n";
import ControlWrapper from "./control-wrapper";
import ColorPicker from "../controls/color-picker";
import { usePresetPanelWrapper } from "./preset-panel-wrapper-utils";

const PresetPanelProfilesFeaturesSidebar = () => {
	const { WapCard } = window?.wapComponents;
	const { wrapper, handleWrapperChange } = usePresetPanelWrapper();

	return (
		<div className="wap-panel-right-sidebar">
			<WapCard bordered={false} className="wap-panel-right-sidebar__card" title={__("Groups", "website-accessibility")}>
				<div className="wap-panel-wrapper-style-grid">
					<ControlWrapper label={__("Background", "website-accessibility")}>
						<ColorPicker
							value={wrapper.sectionBackground}
							onChange={(value) => handleWrapperChange("sectionBackground", value)}
						/>
					</ControlWrapper>
					<ControlWrapper label={__("Border", "website-accessibility")}>
						<ColorPicker
							value={wrapper.sectionBorderColor}
							onChange={(value) => handleWrapperChange("sectionBorderColor", value)}
						/>
					</ControlWrapper>
					<ControlWrapper label={__("Titles", "website-accessibility")}>
						<ColorPicker
							value={wrapper.sectionTitleColor}
							onChange={(value) => handleWrapperChange("sectionTitleColor", value)}
						/>
					</ControlWrapper>
				</div>
			</WapCard>

			<WapCard bordered={false} className="wap-panel-right-sidebar__card" title={__("Tiles", "website-accessibility")}>
				<div className="wap-panel-wrapper-style-grid">
					<ControlWrapper label={__("Background", "website-accessibility")}>
						<ColorPicker
							value={wrapper.cardBackground}
							onChange={(value) => handleWrapperChange("cardBackground", value)}
						/>
					</ControlWrapper>
					<ControlWrapper label={__("Text", "website-accessibility")}>
						<ColorPicker
							value={wrapper.cardTextColor}
							onChange={(value) => handleWrapperChange("cardTextColor", value)}
						/>
					</ControlWrapper>
					<ControlWrapper label={__("Icons", "website-accessibility")}>
						<ColorPicker
							value={wrapper.cardIconColor}
							onChange={(value) => handleWrapperChange("cardIconColor", value)}
						/>
					</ControlWrapper>
					<ControlWrapper label={__("Info icon", "website-accessibility")}>
						<ColorPicker
							value={wrapper.featureInfoIconColor}
							onChange={(value) => handleWrapperChange("featureInfoIconColor", value)}
						/>
					</ControlWrapper>
				</div>
			</WapCard>
		</div>
	);
};

export default PresetPanelProfilesFeaturesSidebar;
