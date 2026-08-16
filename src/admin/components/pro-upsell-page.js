import { __ } from '@wordpress/i18n';

/**
 * Plain placeholder shown for screens that are provided by One Accessibility Pro
 * when that plugin is not installed. Purely informational — nothing here is
 * functional, so nothing is "locked".
 */
const ProUpsellPage = ({ title, description, features = [] }) => {
	const { WapCard, WapButton, WapTypography } = window?.wapComponents || {};
	const { Title, Text } = WapTypography || {};
	const upgradeUrl = window?.websacAdmin?.proUpgradeUrl || 'https://oneaccessibility.com#pricing';

	return (
		<div className="wap-settings wap-pro-upsell-page">
			<WapCard className="wap-settings-row wap-pro-upsell-page__card">
				<span className="wap-pro-upsell-page__badge" aria-hidden="true">
					{__('PRO', 'website-accessibility')}
				</span>
				<Title level={4} className="wap-pro-upsell-page__title">{title}</Title>
				{description ? (
					<Text type="secondary" className="wap-pro-upsell-page__description">{description}</Text>
				) : null}
				{features.length > 0 ? (
					<ul className="wap-pro-upsell-page__features" aria-label={__('Included with One Accessibility Pro', 'website-accessibility')}>
						{features.map((feature) => (
							<li key={feature}>{feature}</li>
						))}
					</ul>
				) : null}
				<Text type="secondary" className="wap-pro-upsell-page__note">
					{__('This screen is part of the separate One Accessibility Pro plugin.', 'website-accessibility')}
				</Text>
				<div className="wap-pro-upsell-page__cta">
					<WapButton type="primary" href={upgradeUrl} target="_blank" rel="noopener noreferrer">
						{__('Learn more about Pro', 'website-accessibility')}
					</WapButton>
				</div>
			</WapCard>
		</div>
	);
};

export const ProfilesUpsell = () => (
	<ProUpsellPage
		title={__('Custom Profiles', 'website-accessibility')}
		description={__('Build your own accessibility profiles that bundle several tools for specific user needs and offer them in the toolbar.', 'website-accessibility')}
		features={[
			__('Unlimited custom profiles with icon and description', 'website-accessibility'),
			__('Pick which tools each profile enables', 'website-accessibility'),
			__('Show custom profiles next to the built-in ones in any preset', 'website-accessibility'),
		]}
	/>
);

export const ToolsUpsell = () => (
	<ProUpsellPage
		title={__('Tools & Backup', 'website-accessibility')}
		description={__('Export and import your complete configuration as a JSON file.', 'website-accessibility')}
		features={[
			__('Download a backup that includes settings, presets and custom profiles', 'website-accessibility'),
			__('Restore configuration on another site or roll back after major changes', 'website-accessibility'),
		]}
	/>
);

export default ProUpsellPage;
