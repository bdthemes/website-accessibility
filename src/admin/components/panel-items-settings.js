import ControlWrapper from "./control-wrapper";
import { __ } from "@wordpress/i18n";
import { normalizeItemLayout } from "../../utils/item-layout";
import ExtensionControl from "./extension-control";

const PanelItemsSettings = ({ attributes, updateAttr, showTooltip = true, defaultLayout = "block" }) => {
	const { WapSwitch, WapTypography, WapSelect } = window?.wapComponents;
	const layoutValue = normalizeItemLayout(attributes.layout, defaultLayout);

	return (
		<>
			<WapTypography.Title level={5} className="wap-features-items-settings__title">
				{__("Items", "website-accessibility")}
			</WapTypography.Title>
			<div className="wap-features-items-settings">
				<ControlWrapper label={__("Hide Item Icons", "website-accessibility")} inline>
					<WapSwitch
						checked={attributes.hideItemIcons}
						onChange={(checked) => updateAttr({ hideItemIcons: checked })}
					/>
				</ControlWrapper>

				<ControlWrapper label={__("Hide Item Labels", "website-accessibility")} inline>
					<WapSwitch
						checked={attributes.hideItemLabels}
						onChange={(checked) => updateAttr({ hideItemLabels: checked })}
					/>
				</ControlWrapper>

				<ControlWrapper label={__("Columns", "website-accessibility")} inline>
					<WapSelect
						value={String(attributes.columns || 2)}
						onChange={(value) => updateAttr({ columns: Number(value) })}
						style={{ minWidth: 120 }}
					>
						{[1, 2, 3, 4, 5, 6].map((count) => (
							<WapSelect.Option key={count} value={String(count)}>
								{count}
							</WapSelect.Option>
						))}
					</WapSelect>
				</ControlWrapper>

				<ControlWrapper label={__("Layout", "website-accessibility")} inline>
					<ExtensionControl slot="panelItemsLayout" attributes={attributes} updateAttr={updateAttr} layoutValue={layoutValue} />
				</ControlWrapper>

				{showTooltip ? (
					<ControlWrapper label={__("Tooltip Position", "website-accessibility")} inline>
						<ExtensionControl slot="panelItemsTooltipPosition" attributes={attributes} updateAttr={updateAttr} />
					</ControlWrapper>
				) : null}
			</div>
		</>
	);
};

export default PanelItemsSettings;
