/**
 * AdminLayout - Header + Sidebar layout (Ant Design) like Sigma Media Manager
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useState, useMemo, useCallback } from '@wordpress/element';
import { useDashboardTour } from '../context/dashboard-tour-context';
import { getBrandDisplayName, useWhiteLabelBrandingEnabled } from '../../utils/brand';
import { getAdminExtensions } from '../../utils/admin-extensions';
import { Layout, Menu, Drawer, Button } from 'antd';
import { useLocation, useHistory } from '../router';
import {
	IconGeneral,
	IconPresets,
	IconSettings,
	IconPro,
	IconInfo,
} from './admin-menu-icons';

const { Header, Sider, Content, Footer } = Layout;

const BDTHEMES_URL = 'https://bdthemes.com';
/** Sticky sider above 1240px; off-canvas drawer at 1240px and below */
const OFFCANVAS_MEDIA_QUERY = '(max-width: 1240px)';

const PLUGIN_VERSION = typeof window !== 'undefined' && window.websacAdmin?.version ? window.websacAdmin.version : '1.3.0';
const HELP_URL = 'https://bdthemes.com/contact/';

const IconMenuToggle = () => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
		<line x1="3" y1="6" x2="21" y2="6" />
		<line x1="3" y1="12" x2="21" y2="12" />
		<line x1="3" y1="18" x2="21" y2="18" />
	</svg>
);

const PRO_FEATURE_LABELS = [
	__('Custom Profiles', 'website-accessibility'),
	__('Export / Import settings', 'website-accessibility'),
	__('White label branding', 'website-accessibility'),
	__('Translation & consent options', 'website-accessibility'),
	__('Accessibility checker & compliance monitoring', 'website-accessibility'),
	__('Screen reader & more Pro widgets', 'website-accessibility'),
	__('Priority support', 'website-accessibility'),
];

/** Bullet list for the “Unlock Pro” card — shown when premium features are not active */
const ProFeaturesListItems = () => (
	<>
		{PRO_FEATURE_LABELS.map((label) => (
			<li key={label}>
				<span className="wap-admin-pro-features-card__icon" aria-hidden="true">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
				</span>
				{label}
			</li>
		))}
	</>
);

const AdminLayout = ({ children }) => {
	const location = useLocation();
	const history = useHistory();
	const currentPage = location?.params?.page || 'website-accessibility';
	// Set (through the admin localized-data filter) by an add-on that replaces this plugin's upsell UI.
	const isProPluginActive = typeof window !== 'undefined' && !!window.websacAdmin?.isProPluginActive;
	const extensions = getAdminExtensions();
	const { tryAdvanceTourViaSidebarMenu } = useDashboardTour();
	const [wlUiEpoch, setWlUiEpoch] = useState(0);
	const [isOffCanvas, setIsOffCanvas] = useState(
		() => typeof window !== 'undefined' && window.matchMedia(OFFCANVAS_MEDIA_QUERY).matches
	);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [adminBarHeight, setAdminBarHeight] = useState(0);

	const brandDisplayName = useMemo(() => getBrandDisplayName(), [wlUiEpoch]);
	const whiteLabelBrandingEnabled = useWhiteLabelBrandingEnabled();

	const settingsHeaderLogoUrl = useMemo(() => {
		const boot = typeof window !== 'undefined' ? window.websacAdmin?.brandLogoUrl : '';
		return typeof boot === 'string' && boot.trim() !== '' ? boot.trim() : '';
	}, [wlUiEpoch]);

	useEffect(() => {
		// Re-read branding + add-on registrations when an add-on signals a change.
		const onWlChange = () => setWlUiEpoch((n) => n + 1);
		window.addEventListener('websac-white-label-changed', onWlChange);
		window.addEventListener('websac-extensions-changed', onWlChange);
		return () => {
			window.removeEventListener('websac-white-label-changed', onWlChange);
			window.removeEventListener('websac-extensions-changed', onWlChange);
		};
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		const updateAdminBarHeight = () => {
			const bar = document.getElementById('wpadminbar');
			const height = bar ? Math.round(bar.getBoundingClientRect().height) : 0;
			setAdminBarHeight(height > 0 ? height : 0);
		};

		updateAdminBarHeight();
		window.addEventListener('resize', updateAdminBarHeight);

		const bar = document.getElementById('wpadminbar');
		let observer;
		if (bar && typeof ResizeObserver !== 'undefined') {
			observer = new ResizeObserver(updateAdminBarHeight);
			observer.observe(bar);
		}

		return () => {
			window.removeEventListener('resize', updateAdminBarHeight);
			observer?.disconnect();
		};
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}
		const mq = window.matchMedia(OFFCANVAS_MEDIA_QUERY);
		const onChange = (event) => {
			const matches = !!event.matches;
			setIsOffCanvas(matches);
			if (!matches) {
				setDrawerOpen(false);
			}
		};
		setIsOffCanvas(mq.matches);
		if (mq.addEventListener) {
			mq.addEventListener('change', onChange);
			return () => mq.removeEventListener('change', onChange);
		}
		mq.addListener(onChange);
		return () => mq.removeListener(onChange);
	}, []);

	const handleMenuClick = ({ key }) => {
		if (tryAdvanceTourViaSidebarMenu(key)) {
			setDrawerOpen(false);
			return;
		}
		// Add-on tours may intercept sidebar navigation.
		if (extensions.sidebarMenuInterceptors.some((intercept) => intercept(key))) {
			setDrawerOpen(false);
			return;
		}
		history.push({ page: key });
		setDrawerOpen(false);
	};

	const openDrawer = useCallback(() => setDrawerOpen(true), []);
	const closeDrawer = useCallback(() => setDrawerOpen(false), []);

	const sortByPosition = (a, b) => (a.position ?? 100) - (b.position ?? 100);
	const extensionItems = (group) =>
		extensions.sidebarItems
			.filter((item) => item.group === group)
			.filter((item) => typeof item.isVisible !== 'function' || item.isVisible())
			.map(({ group: _group, isVisible: _isVisible, position, icon, ...item }) => ({
				...item,
				position,
				// Icons may be provided lazily (add-on bundles load before this one).
				icon: typeof icon === 'function' ? icon() : icon,
			}));

	const generalItems = [
		{ key: 'website-accessibility', position: 10, icon: <IconGeneral />, label: __('General', 'website-accessibility') },
		{ key: 'website-accessibility-presets', position: 20, icon: <IconPresets />, label: <span data-tour="wap-tour-presets-item">{__('Presets', 'website-accessibility')}</span> },
		{
			key: 'website-accessibility-settings',
			position: 40,
			icon: <IconSettings />,
			label: <span data-tour="wap-tour-settings-item">{__('Settings', 'website-accessibility')}</span>,
		},
		...extensionItems('general'),
	].sort(sortByPosition);

	// Sidebar card slot: an add-on may register its own card; otherwise show the plain upsell card.
	const SidebarPromoCard = extensions.controls.sidebarPromoCard || null;
	const supportItems = useMemo(
		() => [
			...(!isProPluginActive ? [{ key: 'website-accessibility-get-pro', position: 10, icon: <IconPro />, label: __('Get Pro', 'website-accessibility') }] : []),
			{ key: 'website-accessibility-about', position: 90, icon: <IconInfo />, label: __('About & Info', 'website-accessibility') },
			...extensionItems('support'),
		].sort(sortByPosition),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[isProPluginActive, extensions.sidebarItems.length, wlUiEpoch]
	);

	// Extra groups contributed by add-ons (e.g. COMPLIANCE).
	const extraGroups = Object.keys(extensions.sidebarGroups)
		.map((group) => ({ group, label: extensions.sidebarGroups[group], children: extensionItems(group).sort(sortByPosition) }))
		.filter((entry) => entry.children.length > 0);

	const menuItems = [
		{
			type: 'group',
			label: <span className="wap-admin-menu-group">GENERAL SETTINGS</span>,
			children: generalItems,
		},
		...extraGroups.map(({ group, label, children }) => ({
			type: 'group',
			key: `group-${group}`,
			label: <span className="wap-admin-menu-group">{label}</span>,
			children,
		})),
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

	const helpSupportLink = (
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
	);

	const renderSidebarNav = (showPromoCard = true) => (
		<>
			<div data-tour="wap-tour-sidebar-menu" className="wap-admin-menu-tour-anchor">
				<Menu
					mode="inline"
					selectedKeys={[selectedKey]}
					items={menuItems}
					onClick={handleMenuClick}
					className="wap-admin-menu"
					style={{ borderRight: 0 }}
				/>
			</div>
			{showPromoCard && typeof window !== 'undefined' ? (
				SidebarPromoCard ? (
					<SidebarPromoCard />
				) : !isProPluginActive ? (
					<div className="wap-admin-pro-features-card">
						<div className="wap-admin-pro-features-card__ribbon" aria-hidden="true">
							{__('PRO', 'website-accessibility')}
						</div>
						<div className="wap-admin-pro-features-card__body">
							<div className="wap-admin-pro-features-card__title">
								{__('Unlock Pro features', 'website-accessibility')}
							</div>
							<ul className="wap-admin-pro-features-card__list">
								<ProFeaturesListItems />
							</ul>
							<a
								href="admin.php?page=website-accessibility-get-pro"
								className="wap-admin-pro-features-card__btn"
							>
								{__('Get Pro', 'website-accessibility')}
							</a>
						</div>
					</div>
				) : null
			) : null}
		</>
	);

	return (
		<Layout className={`wap-admin-layout${isOffCanvas ? ' wap-admin-layout--offcanvas' : ''}`} data-tour="wap-tour-full-dashboard">
			<Header className="wap-admin-header">
				<div className="wap-admin-header-left">
					<span className="wap-admin-header-icon">
						{settingsHeaderLogoUrl ? (
							<img
								src={settingsHeaderLogoUrl}
								alt=""
								className="wap-admin-header-logo"
								width={40}
								height={40}
							/>
						) : (
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
						)}
					</span>

					<div className="wap-admin-header-brand">
						<div className="wap-admin-header-title-row">
							<h1 className="wap-admin-header-title">{brandDisplayName}</h1>
							<span className="wap-admin-header-version">v{PLUGIN_VERSION}</span>
						</div>
						<p className="wap-admin-header-tagline">
							{__('Enhance website accessibility and ensure WCAG compliance with customizable toolbars and profiles.', 'website-accessibility')}
						</p>
					</div>
				</div>
				{isOffCanvas ? (
					<div className="wap-admin-header-right">
						<div className="wap-admin-header-actions">
							<Button
								type="text"
								className="wap-admin-menu-toggle"
								onClick={openDrawer}
								aria-label={__('Open navigation menu', 'website-accessibility')}
								aria-expanded={drawerOpen}
								aria-controls="wap-admin-offcanvas-menu"
								icon={<IconMenuToggle />}
							/>
						</div>
					</div>
				) : !whiteLabelBrandingEnabled ? (
					<div className="wap-admin-header-right">
						<div className="wap-admin-header-actions">
							{helpSupportLink}
						</div>
					</div>
				) : null}
			</Header>
			<Layout>
				{!isOffCanvas ? (
					<Sider width={280} className="wap-admin-sider" theme="light">
						{renderSidebarNav(true)}
					</Sider>
				) : null}
				<Layout className="wap-admin-main-column">
					<Content className="wap-admin-content" data-tour="wap-tour-main-content">
						{children}
					</Content>
				</Layout>
			</Layout>

			{isOffCanvas ? (
				<Drawer
					id="wap-admin-offcanvas-menu"
					placement="right"
					open={drawerOpen}
					onClose={closeDrawer}
					closable={false}
					title={null}
					zIndex={100100}
					width={Math.min(280, typeof window !== 'undefined' ? window.innerWidth - 40 : 280)}
					className="wap-admin-offcanvas-drawer"
					rootClassName="wap-admin-offcanvas-drawer-root"
					styles={{
						mask: {
							top: adminBarHeight,
							height: `calc(100% - ${adminBarHeight}px)`,
						},
						wrapper: {
							top: adminBarHeight,
							height: `calc(100% - ${adminBarHeight}px)`,
						},
						header: { display: 'none', height: 0, padding: 0, borderBottom: 'none' },
						body: { padding: 0, overflow: 'auto', height: '100%' },
					}}
					destroyOnClose={false}
				>
					<div className="wap-admin-sider wap-admin-sider--drawer">
						{renderSidebarNav(false)}
						{!whiteLabelBrandingEnabled ? (
							<div className="wap-admin-offcanvas-help">
								{helpSupportLink}
							</div>
						) : null}
					</div>
				</Drawer>
			) : null}

			<Footer className="wap-admin-footer">
				<span className="wap-admin-footer__text">
					{brandDisplayName} v{PLUGIN_VERSION}
					{typeof window !== 'undefined' && !window.websacAdmin?.whiteLabelFooterHidden ? (
						<>
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
						</>
					) : null}
				</span>
			</Footer>
		</Layout>
	);
};

export default AdminLayout;
