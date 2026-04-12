import { __ } from "@wordpress/i18n";
import { useSelect, useDispatch } from "@wordpress/data";
import { STORE_NAME } from "../store";
import ControlWrapper from "./control-wrapper";
import ColorPicker from "../controls/color-picker";



const PresetPanelRightSidebar = () => {
	const { WapSelect, WapInput, WapCard } = window?.wapComponents;
	const { presetsFormData } = useSelect((select) =>
		select(STORE_NAME).getPresetsFormData(),
	);
	const { setPresetsFormData } = useDispatch(STORE_NAME);

	const handleWrapperChange = (key, value) => {
		setPresetsFormData({
			...presetsFormData,
			panel: {
				...presetsFormData.panel,
				wrapper: {
					...presetsFormData.panel?.wrapper,
					[key]: value,
				},
			},
		});
	};

	const wrapper = presetsFormData?.panel?.wrapper || {};

	return (
		<div className="wap-panel-right-sidebar">
			<WapCard bordered={false} className="wap-panel-right-sidebar__card" title={__("Layout", "website-accessibility")}>
				<div className="wap-panel-right-sidebar__layout-grid">
					<ControlWrapper label={__("Panel Position", "website-accessibility")}>
						<WapSelect
							value={wrapper.position || "right"}
							onChange={(value) => handleWrapperChange("position", value)}
						>
							<WapSelect.Option value="left">{__("Left Side", "website-accessibility")}</WapSelect.Option>
							<WapSelect.Option value="right">{__("Right Side", "website-accessibility")}</WapSelect.Option>
						</WapSelect>
					</ControlWrapper>
					<ControlWrapper label={__("Width (px)", "website-accessibility")}>
						<WapInput
							type="number"
							min={200}
							max={1000}
							value={wrapper.width || 420}
							onChange={(e) => handleWrapperChange("width", e.target.value)}
							addonAfter="px"
						/>
					</ControlWrapper>
					<ControlWrapper label={__("Max height (vh)", "website-accessibility")}>
					<WapInput
						type="number"
						min={10}
						max={100}
						value={wrapper.maxHeight > 100 ? 80 : (wrapper.maxHeight ?? 80)}
						onChange={(e) => handleWrapperChange("maxHeight", e.target.value)}
						addonAfter="vh"
					/>
					</ControlWrapper>
					<ControlWrapper label={__("Background Color", "website-accessibility")}>
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
