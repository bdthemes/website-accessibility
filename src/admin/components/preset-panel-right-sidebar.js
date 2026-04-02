import { __ } from "@wordpress/i18n";
import { useSelect, useDispatch } from "@wordpress/data";
import { STORE_NAME } from "../store";
import ControlWrapper from "./control-wrapper";
import ColorPicker from "../controls/color-picker";



const PresetPanelRightSidebar = () => {
	const { WapSelect, WapInput, WapCard, WapRow, WapCol } = window?.wapComponents;
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
				<WapRow gutter={[16, 0]}>
					<WapCol xs={24} md={6}>
						<ControlWrapper label={__("Panel Position", "website-accessibility")}>
							<WapSelect
								value={wrapper.position || "right"}
								onChange={(value) => handleWrapperChange("position", value)}
							>
								<WapSelect.Option value="left">{__("Left Side", "website-accessibility")}</WapSelect.Option>
								<WapSelect.Option value="right">{__("Right Side", "website-accessibility")}</WapSelect.Option>
							</WapSelect>
						</ControlWrapper>
					</WapCol>
					<WapCol xs={24} md={6}>
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
					</WapCol>
				</WapRow>
			</WapCard>

			<WapCard bordered={false} className="wap-panel-right-sidebar__card" title={__("Style", "website-accessibility")}>
				<div className="wap-panel-wrapper-style-grid">
					<ControlWrapper label={__("Background Color", "website-accessibility")}>
						<ColorPicker
							value={wrapper.background}
							onChange={(value) => handleWrapperChange("background", value)}
						/>
					</ControlWrapper>
					<ControlWrapper label={__("Border", "website-accessibility")}>
						<WapInput
							value={wrapper.border || ""}
							onChange={(e) => handleWrapperChange("border", e.target.value)}
							placeholder="e.g., 1px solid #e0e0e0"
						/>
					</ControlWrapper>
					<ControlWrapper label={__("Padding", "website-accessibility")}>
						<WapInput
							value={wrapper.padding || ""}
							onChange={(e) => handleWrapperChange("padding", e.target.value)}
							placeholder="e.g., 20px"
						/>
					</ControlWrapper>
					<ControlWrapper label={__("Border Radius", "website-accessibility")}>
						<WapInput
							value={wrapper.borderRadius || ""}
							onChange={(e) => handleWrapperChange("borderRadius", e.target.value)}
							placeholder="e.g., 8px"
						/>
					</ControlWrapper>
					<ControlWrapper label={__("Box Shadow", "website-accessibility")}>
						<WapInput
							value={wrapper.boxShadow || ""}
							onChange={(e) => handleWrapperChange("boxShadow", e.target.value)}
							placeholder="e.g., 0 4px 24px rgba(0,0,0,0,0.1)"
						/>
					</ControlWrapper>
				</div>
			</WapCard>
		</div>
	);
};

export default PresetPanelRightSidebar;
