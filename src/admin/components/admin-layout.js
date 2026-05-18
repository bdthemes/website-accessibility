/**
 * AdminLayout - Header + Sidebar layout (Ant Design) like Sigma Media Manager
 */
import { __ } from '@wordpress/i18n';
import { useDashboardTour } from '../context/dashboard-tour-context';
import { useLicense } from '../context/LicenseContext';
import { Layout, Menu } from 'antd';
import { useLocation, useHistory } from '../router';
import {
	IconGeneral,
	IconPresets,
	IconProfiles,
	IconCssOverrides,
	IconSettings,
	IconLicense,
	IconTools,
	IconPro,
	IconInfo,
	IconFixedIssues,
} from './admin-menu-icons';

const { Header, Sider, Content, Footer } = Layout;

const BDTHEMES_URL = 'https://bdthemes.com';

const PLUGIN_VERSION = typeof window !== 'undefined' && window.websacAdmin?.version ? window.websacAdmin.version : '1.3.0';
const HELP_URL = 'https://bdthemes.com/contact/';

const IconComingSoonBullet = () => (
	<span className="wap-admin-pro-features-card__icon" aria-hidden="true">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
			<circle cx="12" cy="12" r="3" />
		</svg>
	</span>
);

/** Same bullet list as free “Unlock Pro” card — shown for free users and Pro-without-license users */
const ProFeaturesListItems = () => (
	<>
		<li>
			<span className="wap-admin-pro-features-card__icon" aria-hidden="true">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
			</span>
			{__('Custom Profiles', 'website-accessibility')}
		</li>
		<li>
			<span className="wap-admin-pro-features-card__icon" aria-hidden="true">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
			</span>
			{__('Export / Import settings', 'website-accessibility')}
		</li>
		<li>
			<span className="wap-admin-pro-features-card__icon" aria-hidden="true">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
			</span>
			{__('Translation & consent options', 'website-accessibility')}
		</li>
		<li>
			<span className="wap-admin-pro-features-card__icon" aria-hidden="true">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
			</span>
			{__('Accessibility checker', 'website-accessibility')}
		</li>
		<li>
			<span className="wap-admin-pro-features-card__icon" aria-hidden="true">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
			</span>
			{__('Priority support', 'website-accessibility')}
		</li>
	</>
);

const AdminLayout = ({ children }) => {
	const location = useLocation();
	const history = useHistory();
	const currentPage = location?.params?.page || 'website-accessibility';
	const { isProActive: isLicenseValid, isProPluginActive } = useLicense();
	const { tryAdvanceTourViaPresetsMenu } = useDashboardTour();
	const hasFixedIssuesPage = !!window?.websacAdmin?.hasFixedIssuesPage;

	const handleMenuClick = ({ key }) => {
		if (tryAdvanceTourViaPresetsMenu(key)) {
			return;
		}
		history.push({ page: key });
	};

	const generalItems = [
		{ key: 'website-accessibility', icon: <IconGeneral />, label: __('General', 'website-accessibility') },
		{ key: 'website-accessibility-presets', icon: <IconPresets />, label: <span data-tour="wap-tour-presets-item">{__('Presets', 'website-accessibility')}</span> },
		{ key: 'website-accessibilityfiles', icon: <IconProfiles />, label: __('Custom Profiles', 'website-accessibility') },
		{ key: 'website-accessibility-settings', icon: <IconSettings />, label: __('Settings', 'website-accessibility') },
		...(
			isProPluginActive &&
			isLicenseValid &&
			(hasFixedIssuesPage || currentPage === 'website-accessibility-fixed-issues')
				? [{ key: 'website-accessibility-fixed-issues', icon: <IconFixedIssues />, label: __('Fixed Issues', 'website-accessibility') }]
				: []
		),
		{ key: 'website-accessibility-css-overrides', icon: <IconCssOverrides />, label: __('CSS Overrides', 'website-accessibility') },
	].filter(Boolean);

	const comingSoonFeatureLabels = [
		__('Enhanced analytics & usage insights', 'website-accessibility'),
		__('New preset packs & panel styles', 'website-accessibility'),
		__('Deeper WCAG checks & reporting', 'website-accessibility'),
		__('Bulk tools for multi-site workflows', 'website-accessibility'),
		__('More integrations & API options', 'website-accessibility'),
	];
	/** Pro installed + license active → “Coming soon”; otherwise Pro upsell list (free or Pro without license) */
	const showComingSoonCard = isProPluginActive && isLicenseValid;
	const supportItems = [
		...(!isLicenseValid ? [{ key: 'website-accessibility-get-pro', icon: <IconPro />, label: __('Get Pro', 'website-accessibility') }] : []),
		...(isProPluginActive ? [{ key: 'website-accessibility-license', icon: <IconLicense />, label: __('License', 'website-accessibility') }] : []),
		...(isProPluginActive ? [{ key: 'website-accessibility-tools', icon: <IconTools />, label: __('Tools & Backup', 'website-accessibility'), disabled: !isLicenseValid }] : []),
		{ key: 'website-accessibility-about', icon: <IconInfo />, label: __('About & Info', 'website-accessibility') },
	];

	const menuItems = [
		{
			type: 'group',
			label: <span className="wap-admin-menu-group">GENERAL SETTINGS</span>,
			children: generalItems,
		},
		{
			type: 'group',
			label: <span className="wap-admin-menu-group">SUPPORT</span>,
			children: supportItems,
		},
	];

	// For sub-pages (edit, create, preview) highlight the parent menu
	const selectedKey = ['website-accessibility-presets-edit', 'website-accessibility-presets-create', 'website-accessibility-presets-preview'].includes(currentPage)
		? 'website-accessibility-presets'
		: ['website-accessibilityfiles-edit', 'website-accessibilityfiles-create'].includes(currentPage)
			? 'website-accessibilityfiles'
			: currentPage;

	return (
		<Layout className="wap-admin-layout" data-tour="wap-tour-full-dashboard">
			<Header className="wap-admin-header">
				<div className="wap-admin-header-left">
					<span className="wap-admin-header-icon">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 256 256"
							aria-hidden="true"
							focusable="false"
							width="40"
							height="40"
						>
							<defs>
								<linearGradient
									id="wap-admin-header-logo-gradient"
									x1="14.32"
									y1="34.83"
									x2="190.78"
									y2="224.07"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0" stopColor="#007bff" />
									<stop offset="1" stopColor="#005a9c" />
								</linearGradient>
							</defs>
							{/* White background */}
							<rect width="256" height="256" fill="#fff" />
							{/* Blue gradient shape */}
							<path
								fill="url(#wap-admin-header-logo-gradient)"
								d="M95.71,37.49h62.01c3.03,0,5.73,1.91,6.76,4.76l53.59,166.61c1.68,4.69-1.79,9.63-6.76,9.63H44.68c-4.93,0-8.39-4.86-6.8-9.53L88.92,42.36c.99-2.91,3.73-4.87,6.8-4.87Z"
							/>
							{/* Cutouts (white) */}
							<circle
								fill="#fff"
								cx="128.02"
								cy="105.92"
								r="15.14"
								transform="translate(-9.81 13.13) rotate(-5.65)"
							/>
							<path
								fill="#fff"
								d="M179.31,127.49c-1.89-5.11-7.57-7.71-12.68-5.82-11.48,4.25-25.11,6.5-39.41,6.5s-27.61-2.2-39-6.35c-5.12-1.87-10.78.77-12.65,5.89-1.87,5.12.77,10.78,5.89,12.65,8.35,3.05,17.58,5.2,27.27,6.41.75,6.84.94,13.93.58,21.14-.96,19.09-5.89,37.31-13.53,50-.12.2-.22.4-.32.61h22.22c4.99-10.97,8.5-23.75,10.25-37.42,1.75,13.67,5.26,26.45,10.25,37.42h22.22c-.1-.2-.2-.41-.32-.61-7.64-12.69-12.57-30.91-13.53-50-.36-7.27-.16-14.43.6-21.33,9.36-1.26,18.26-3.41,26.33-6.41,5.11-1.89,7.72-7.57,5.82-12.68Z"
							/>
						</svg>
					</span>

					<div className="wap-admin-header-brand">
						<div className="wap-admin-header-title-row">
							<h1 className="wap-admin-header-title">{__('One Accessibility', 'website-accessibility')}</h1>
							<span className="wap-admin-header-version">v{PLUGIN_VERSION}</span>
						</div>
						<p className="wap-admin-header-tagline">
							{__('Enhance website accessibility and ensure WCAG compliance with customizable toolbars and profiles.', 'website-accessibility')}
						</p>
					</div>
				</div>
				<div className="wap-admin-header-right">
					<div className="wap-admin-header-actions">
						<a href={HELP_URL} target="_blank" rel="noopener noreferrer" className="wap-admin-header-help">
						<span className="wap-admin-header-help-icon" aria-hidden="true">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								width="18"
								height="18"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								focusable="false"
							>
								<circle cx="12" cy="12" r="10" />
								<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
								<line x1="12" y1="17" x2="12.01" y2="17" />
							</svg>
						</span>
						{__('Help & Support', 'website-accessibility')}
					</a>
					</div>
				</div>
			</Header>
			<Layout>
				<Sider width={280} className="wap-admin-sider" theme="light">
					<div data-tour="wap-tour-sidebar-menu" className="wap-admin-menu-tour-anchor">
						<Menu
							mode="inline"
							selectedKeys={[selectedKey]}
							items={menuItems}
							onClick={handleMenuClick}
							className="wap-admin-menu"
							style={{ borderRight: 0, height: '100%' }}
						/>
					</div>
					{typeof window !== 'undefined' && (
						<div className="wap-admin-pro-features-card">
							<div className="wap-admin-pro-features-card__ribbon" aria-hidden="true">
								{showComingSoonCard
									? __('COMING SOON', 'website-accessibility')
									: __('PRO', 'website-accessibility')}
							</div>
							<div className="wap-admin-pro-features-card__body">
								<div className="wap-admin-pro-features-card__title">
									{showComingSoonCard
										? __('Coming soon features', 'website-accessibility')
										: isProPluginActive
											? __('Pro features', 'website-accessibility')
											: __('Unlock Pro features', 'website-accessibility')}
								</div>
								<ul className="wap-admin-pro-features-card__list">
									{showComingSoonCard ? (
										<>
											{comingSoonFeatureLabels.map((label, idx) => (
												<li key={idx}>
													<IconComingSoonBullet />
													{label}
												</li>
											))}
										</>
									) : (
										<ProFeaturesListItems />
									)}
								</ul>
								{showComingSoonCard ? (
									<p className="wap-admin-pro-features-card__footnote">
										{__('Stay tuned — we will ship these in upcoming releases.', 'website-accessibility')}
									</p>
								) : isProPluginActive ? (
									<a
										href={
											window.websacAdmin?.licensePageUrl ||
											'admin.php?page=website-accessibility-license'
										}
										className="wap-admin-pro-features-card__btn"
									>
										{__('Activate License', 'website-accessibility')}
									</a>
								) : (
									<a
										href="admin.php?page=website-accessibility-get-pro"
										className="wap-admin-pro-features-card__btn"
									>
										{__('Get Pro', 'website-accessibility')}
									</a>
								)}
							</div>
						</div>
					)}
				</Sider>
				<Layout className="wap-admin-main-column">
					<Content className="wap-admin-content" data-tour="wap-tour-main-content">
						{children}
					</Content>

				</Layout>
			</Layout>

			<Footer className="wap-admin-footer">
						<span className="wap-admin-footer__text">
							{__('One Accessibility', 'website-accessibility')} v{PLUGIN_VERSION}
							<span className="wap-admin-footer__sep" aria-hidden="true">
								{' | '}
							</span>
							{__('Made with', 'website-accessibility')}{' '}
							<span className="wap-admin-footer__heart" aria-hidden="true">
								❤️
							</span>{' '}
							{__('by', 'website-accessibility')}{' '}
							<a
								href={BDTHEMES_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="wap-admin-footer__link"
							>
								BdThemes
							</a>
						</span>
					</Footer>
		</Layout>
	);
};

export default AdminLayout;
