import { InputNumber, Input, Select } from "antd";
import { __ } from "@wordpress/i18n";
import { useSelect, useDispatch } from "@wordpress/data";
import { STORE_NAME } from "../store";
import ControlWrapper from "./control-wrapper";
import ColorPicker from "../controls/color-picker";
import WapInput from "../../components/wap-input";

const { Option } = Select;

const PresetPanelRightSidebar = () => {
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
		<>
			<ControlWrapper label={__("Panel Position", "website-accessibility")}>
				<Select
					value={wrapper.position || "right"}
					onChange={(value) => handleWrapperChange("position", value)}
					className="wap-panel-right-sidebar__full-width"
				>
					<Option value="left">{__("Left Side", "website-accessibility")}</Option>
					<Option value="right">{__("Right Side", "website-accessibility")}</Option>
				</Select>
			</ControlWrapper>
			<ControlWrapper label={__("Width (px)", "website-accessibility")}>
				<InputNumber
					min={200}
					max={1000}
					value={wrapper.width || 420}
					onChange={(value) => handleWrapperChange("width", value)}
					className="wap-panel-right-sidebar__full-width"
				/>
			</ControlWrapper>

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
					className="wap-panel-right-sidebar__full-width"
				/>
			</ControlWrapper>

			<ControlWrapper label={__("Padding", "website-accessibility")}>
				<WapInput
					value={wrapper.padding || ""}
					onChange={(e) => handleWrapperChange("padding", e.target.value)}
					placeholder="e.g., 20px"
					className="wap-panel-right-sidebar__full-width"
				/>
			</ControlWrapper>

			<ControlWrapper label={__("Border Radius", "website-accessibility")}>
				<WapInput
					value={wrapper.borderRadius || ""}
					onChange={(e) => handleWrapperChange("borderRadius", e.target.value)}
					placeholder="e.g., 8px"
					className="wap-panel-right-sidebar__full-width"
				/>
			</ControlWrapper>

			<ControlWrapper label={__("Box Shadow", "website-accessibility")}>
				<WapInput
					value={wrapper.boxShadow || ""}
					onChange={(e) => handleWrapperChange("boxShadow", e.target.value)}
					placeholder="e.g., 0 4px 24px rgba(0,0,0,0.1)"
					className="wap-panel-right-sidebar__full-width"
				/>
			</ControlWrapper>

		</>
	);
};

export default PresetPanelRightSidebar;
