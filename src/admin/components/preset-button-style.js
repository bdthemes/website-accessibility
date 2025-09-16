import { Card, Flex, Input, Radio, Select, Switch, Tabs } from "antd";
import { __ } from "@wordpress/i18n";
import { useSelect, useDispatch } from "@wordpress/data";
import { STORE_NAME } from "../store";
import IconPicker from "./icon-picker";
import ControlWrapper from "./control-wrapper";
import clsx from "clsx";

const ContentTab = ({ button, handleButtonChange }) => (
	<>
		<ControlWrapper label={__("Button Text", "website-accessibility")}>
			<Input
				value={button.text || ""}
				onChange={(e) => handleButtonChange("text", e.target.value)}
				placeholder={__("Click Me", "website-accessibility")}
			/>
		</ControlWrapper>

		<ControlWrapper label={__("Button Type", "website-accessibility")}>
			<Flex vertical gap="middle">
			<Radio.Group
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
		</Flex>
		</ControlWrapper>

		{button.buttonType !== "text" && (
			<ControlWrapper label={__("Select Icon", "website-accessibility")}>
				<IconPicker
					value={button.icon}
					onChange={(value) => handleButtonChange("icon", value)}
				/>
			</ControlWrapper>
		)}
	</>
);

const StyleTab = ({ button, handleButtonChange }) => (
	<>
		<ControlWrapper label={__("Text Color", "website-accessibility")}>
			<Input
				type="color"
				value={button.color || "#ffffff"}
				onChange={(e) => handleButtonChange("color", e.target.value)}
			/>
		</ControlWrapper>

		<ControlWrapper label={__("Background Color", "website-accessibility")}>
			<Input
				type="color"
				value={button.bgColor || "#1677ff"}
				onChange={(e) => handleButtonChange("bgColor", e.target.value)}
			/>
		</ControlWrapper>

		<ControlWrapper label={__("Padding", "website-accessibility")}>
			<Input
				value={button.padding || ""}
				onChange={(e) => handleButtonChange("padding", e.target.value)}
				placeholder="e.g., 10px 20px"
			/>
		</ControlWrapper>

		<ControlWrapper label={__("Border Radius", "website-accessibility")}>
			<Input
				value={button.borderRadius || ""}
				onChange={(e) => handleButtonChange("borderRadius", e.target.value)}
				placeholder="e.g., 6px"
			/>
		</ControlWrapper>
	</>
);

const ButtonStylePreset = () => {
	const { PreviewButton, Icon } = window?.wapComponents;
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

	const tabItems = [
		{
			key: "content",
			label: __("Content", "website-accessibility"),
			children: (
				<ContentTab button={button} handleButtonChange={handleButtonChange} />
			),
		},
		{
			key: "style",
			label: __("Style", "website-accessibility"),
			children: (
				<StyleTab button={button} handleButtonChange={handleButtonChange} />
			),
		},
	];

	return (
		<Card className="wap-button-style-preset-card" style={{ margin: "0 auto" }}>
			<div className="wap-button-style-preset">
				<div className="wap-button-style-preset__left">
					<Tabs defaultActiveKey="content" items={tabItems} />
				</div>
				<div className="wap-button-style-preset__center">
					<div className="wap-os-style-wrapper">
						<span className="wap-os-style"></span>
						<span className="wap-os-style"></span>
						<span className="wap-os-style"></span>
					</div>
					<div className="wap-button-style-preset__preview-wrapper">
						<PreviewButton
							type="default"
							text={button?.buttonType == "icon" ? null : button?.text}
							icon={button?.buttonType !== "text" ? <Icon name={button?.icon} /> : null}
							className={clsx("wap-button-style-preset__preview-btn", position)}
							style={{
								"--button-color": button.color,
								"--button-bg": button.bgColor,
								"--button-padding": button.padding,
								"--button-radius": button.borderRadius,
								"--button-offset-x": button.offsetX
									? `${button.offsetX}px`
									: "0",
								"--button-offset-y": button.offsetY
									? `${button.offsetY}px`
									: "0",
							}}
						/>
					</div>
				</div>
				<div className="wap-button-style-preset__right">
					<ControlWrapper
						label={__("Button Position", "website-accessibility")}
					>
						<Select
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

					<ControlWrapper
						label={__("Horizontal Offset", "website-accessibility")}
					>
						<Input
							type="number"
							value={button.offsetX || ""}
							onChange={(e) => handleButtonChange("offsetX", e.target.value)}
							placeholder="e.g., 20"
							addonAfter="px"
						/>
					</ControlWrapper>

					<ControlWrapper
						label={__("Vertical Offset", "website-accessibility")}
					>
						<Input
							type="number"
							value={button.offsetY || ""}
							onChange={(e) => handleButtonChange("offsetY", e.target.value)}
							placeholder="e.g., 20"
							addonAfter="px"
						/>
					</ControlWrapper>
				</div>
			</div>
		</Card>
	);
};

export default ButtonStylePreset;
