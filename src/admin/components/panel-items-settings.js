import ControlWrapper from "./control-wrapper";
import { __ } from "@wordpress/i18n";
import { useLicense } from "../context/LicenseContext";
import { normalizeItemLayout } from "../../utils/item-layout";

const PanelItemsSettings = ({ attributes, updateAttr, showTooltip = true, defaultLayout = "block" }) => {
	const { WapSwitch, WapTypography, WapSelect, WapRadio, WapBadge } = window?.wapComponents;
	const { isProActive } = useLicense();
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
					{isProActive ? (
						<WapRadio.Group
							block
							className="wap-features-layout-radio"
							options={[
								{ label: __('Inline', 'website-accessibility'), value: 'inline' },
								{ label: __('Block', 'website-accessibility'), value: 'block' },
							]}
							value={layoutValue}
							onChange={(e) => updateAttr({ layout: e.target.value })}
							optionType="button"
							buttonStyle="solid"
						/>
					) : (
						<WapBadge color="gold" count={__("PRO", "website-accessibility")} />
					)}
				</ControlWrapper>

				{showTooltip ? (
					<ControlWrapper label={__("Tooltip Position", "website-accessibility")} inline>
						{isProActive ? (
							<WapSelect
								value={attributes.tooltipPosition || 'topLeft'}
								onChange={(value) => updateAttr({ tooltipPosition: value })}
								style={{ minWidth: 160 }}
							>
								<WapSelect.Option value="topLeft">{__('Top Left', 'website-accessibility')}</WapSelect.Option>
								<WapSelect.Option value="topRight">{__('Top Right', 'website-accessibility')}</WapSelect.Option>
								<WapSelect.Option value="bottomLeft">{__('Bottom Left', 'website-accessibility')}</WapSelect.Option>
								<WapSelect.Option value="bottomRight">{__('Bottom Right', 'website-accessibility')}</WapSelect.Option>
							</WapSelect>
						) : (
							<WapBadge color="gold" count={__("PRO", "website-accessibility")} />
						)}
					</ControlWrapper>
				) : null}
			</div>
		</>
	);
};

export default PanelItemsSettings;
