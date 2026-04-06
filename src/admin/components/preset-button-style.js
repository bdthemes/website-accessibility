import { __ } from "@wordpress/i18n";
import { useSelect, useDispatch } from "@wordpress/data";
import { STORE_NAME } from "../store";
import IconPicker from "./icon-picker";
import ControlWrapper from "./control-wrapper";
import ColorPicker from "../controls/color-picker";

const ButtonStylePreset = () => {
	const { WapSelect, WapInput, WapCard, WapRow, WapCol, WapRadio, WapFlex } = window?.wapComponents;
	const { presetsFormData } = useSelect((select) =>
		select(STORE_NAME).getPresetsFormData(),
	);
	const { setPresetsFormData } = useDispatch(STORE_NAME);

	const handleButtonChange = (key, value) => {
		setPresetsFormData({
			...presetsFormData,
			button: {
				...presetsFormData.button,
				[key]: value,
			},
		});
	};

	const button = presetsFormData?.button || {};
	const position = button.position || "bottom-right";

	return (
		<div className="wap-button-style-preset">
			<WapCard bordered={false} className="wap-button-style-preset-card" title={__("Content", "website-accessibility")}>
				<WapRow gutter={[16, 16]}>
					<WapCol span={12}>
						<ControlWrapper label={__("Button Type", "website-accessibility")}>
							<WapFlex vertical gap="middle">
								<WapRadio.Group
									block
									options={[
										{ label: __("Icon", "website-accessibility"), value: "icon" },
										{ label: __("Text", "website-accessibility"), value: "text" },
										{ label: __("Both", "website-accessibility"), value: "both" },
									]}
									value={button?.buttonType}
									onChange={(e) => handleButtonChange("buttonType", e.target.value)}
									optionType="button"
									buttonStyle="solid"
								/>
							</WapFlex>
						</ControlWrapper>
					</WapCol>

					{button.buttonType !== "text" && (
						<WapCol span={12}>
							<ControlWrapper label={__("Select Icon", "website-accessibility")}>
								<IconPicker
									value={button.icon}
									onChange={(value) => handleButtonChange("icon", value)}
								/>
							</ControlWrapper>
						</WapCol>
					)}

					{button.buttonType !== "icon" && (
						<WapCol span={24}>
							<ControlWrapper label={__("Button Text", "website-accessibility")}>
								<WapInput
									value={button.text || ""}
									onChange={(e) => handleButtonChange("text", e.target.value)}
									placeholder={__("Click Me", "website-accessibility")}
								/>
							</ControlWrapper>
						</WapCol>
					)}

				</WapRow>
			</WapCard>

			<WapCard bordered={false} className="wap-button-style-preset-card" title={__("Style", "website-accessibility")}>
				<div className="wap-button-style-grid">
					{/* <ControlWrapper label={__("Font Size", "website-accessibility")}>
						<WapInput
							value={button?.fontSize || ""}
							onChange={(e) => handleButtonChange("fontSize", e.target.value)}
							placeholder="e.g., 14px"
						/>
					</ControlWrapper> */}
					{/* <ControlWrapper label={__("Icon Size", "website-accessibility")}>
						<WapInput
							value={button?.iconSize || ""}
							onChange={(e) => handleButtonChange("iconSize", e.target.value)}
							placeholder="e.g., 14px"
						/>
					</ControlWrapper> */}
					<ControlWrapper label={__("Text Color", "website-accessibility")}>
						<ColorPicker
							value={button.color}
							onChange={(value) => handleButtonChange("color", value)}
						/>
					</ControlWrapper>
					<ControlWrapper label={__("Background Color", "website-accessibility")}>
						<ColorPicker
							value={button.bgColor}
							onChange={(value) => handleButtonChange("bgColor", value)}
						/>
					</ControlWrapper>
					{/* <ControlWrapper label={__("Padding", "website-accessibility")}>
						<WapInput
							value={button.padding || ""}
							onChange={(e) => handleButtonChange("padding", e.target.value)}
							placeholder="e.g., 10px 20px"
						/>
					</ControlWrapper> */}
					<ControlWrapper label={__("Border Radius", "website-accessibility")}>
						<WapInput
							value={button.borderRadius || ""}
							onChange={(e) => handleButtonChange("borderRadius", e.target.value)}
							placeholder="e.g., 6px"
						/>
					</ControlWrapper>
				</div>
			</WapCard>

			<WapCard bordered={false} className="wap-button-style-preset-card" title={__("Position", "website-accessibility")}>
				<div className="wap-button-style-position-grid">
					<ControlWrapper label={__("Button Position", "website-accessibility")}>
						<WapSelect
							value={position}
							onChange={(value) => handleButtonChange("position", value)}
							options={[
								{
									value: "bottom-right",
									label: __("Bottom Right", "website-accessibility"),
								},
								{
									value: "bottom-left",
									label: __("Bottom Left", "website-accessibility"),
								},
								{
									value: "top-right",
									label: __("Top Right", "website-accessibility"),
								},
								{
									value: "top-left",
									label: __("Top Left", "website-accessibility"),
								},
							]}
						/>
					</ControlWrapper>
					<ControlWrapper label={__("Horizontal Offset", "website-accessibility")}>
						<WapInput
							type="number"
							value={button.offsetX || ""}
							onChange={(e) => handleButtonChange("offsetX", e.target.value)}
							placeholder="e.g., 20"
							addonAfter="px"
						/>
					</ControlWrapper>
					<ControlWrapper label={__("Vertical Offset", "website-accessibility")}>
						<WapInput
							type="number"
							value={button.offsetY || ""}
							onChange={(e) => handleButtonChange("offsetY", e.target.value)}
							placeholder="e.g., 20"
							addonAfter="px"
						/>
					</ControlWrapper>
				</div>
			</WapCard>
		</div>
	);
};

export default ButtonStylePreset;
