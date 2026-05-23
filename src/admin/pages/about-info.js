import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __, sprintf } from '@wordpress/i18n';
import { useDashboardTour } from '../context/dashboard-tour-context';
import { useBrandDisplayName, useWhiteLabelBrandingEnabled } from '../../utils/websacData';
import { useProSettingsTour } from '../context/pro-settings-tour-context';
import { useLicense } from '../context/LicenseContext';

const DOCS_URL = 'https://bdthemes.com/all-knowledge-base-of-one-accessibility/';
const SUPPORT_URL = 'https://bdthemes.com/contact/';

const AboutInfo = () => {
	const { WapCard, WapButton, WapTypography } = window?.wapComponents;
	const { Title, Text } = WapTypography;
	const { startTour } = useDashboardTour();
	const brandDisplayName = useBrandDisplayName();
	const whiteLabelBrandingEnabled = useWhiteLabelBrandingEnabled();
	const { startProSettingsTour } = useProSettingsTour();
	const { isProActive, isProPluginActive } = useLicense();
	const pluginVersion = typeof window !== 'undefined' && window.websacAdmin?.version ? window.websacAdmin.version : '1.3.0';

	const [systemInfo, setSystemInfo] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchInfo = async () => {
			try {
				const res = await apiFetch({ path: '/sigmally/v1/system-info' });
				if (res?.success !== false) {
					setSystemInfo(res);
				}
			} catch (err) {
				console.error('Failed to load system info:', err);
			} finally {
				setLoading(false);
			}
		};
		fetchInfo();
	}, []);

	const info = systemInfo || {};
	const stats = [
		{ label: __('Plugin Version', 'website-accessibility'), value: info.plugin_version || pluginVersion, color: 'purple' },
		{ label: __('Total Presets', 'website-accessibility'), value: String(info.presets_count ?? '—'), color: 'blue' },
		{ label: __('Total Profiles', 'website-accessibility'), value: String(info.profiles_count ?? '—'), color: 'green' },
		{ label: __('Max Upload Size', 'website-accessibility'), value: info.max_upload_size || '—', color: 'orange' },
	];

	const details = [
		{ label: __('WordPress Version', 'website-accessibility'), value: info.wordpress_version || '—' },
		{ label: __('PHP Version', 'website-accessibility'), value: info.php_version || '—' },
		{ label: __('MySQL Version', 'website-accessibility'), value: info.mysql_version || '—' },
	];

	return (
		<div className="wap-settings wap-about-info">
			<WapCard className="wap-settings-row wap-header-card wap-about-info-header">
				<div className="wap-about-info-header__inner">
					<div className="wap-header-card-content">
						<Title level={4} className="wap-header-card-title">
							{__('About & Info', 'website-accessibility')}
						</Title>
						<Text type="secondary" className="wap-header-card-description">
							{__('System information and plugin overview', 'website-accessibility')}
						</Text>
					</div>
					<div className="wap-about-info-header__actions">
						<button type="button" className="wap-about-info-header__tour" onClick={startTour}>
							{__('Quick tour', 'website-accessibility')}
						</button>
						{isProPluginActive && isProActive && (
							<button
								type="button"
								className="wap-about-info-header__tour wap-about-info-header__tour--pro"
								onClick={() => startProSettingsTour({ force: true })}
							>
								{__('Pro settings tour', 'website-accessibility')}
							</button>
						)}
					</div>
				</div>
			</WapCard>

			{/* System Information */}
			<div className="wap-about-info__section">
				<Title level={5} className="wap-about-info__section-title">
					{__('System Information', 'website-accessibility')}
				</Title>
				<Text type="secondary" className="wap-about-info__section-desc">
					{__('Overview of your accessibility setup and plugin status', 'website-accessibility')}
				</Text>

				{loading ? (
					<div className="wap-about-info__loading">{__('Loading…', 'website-accessibility')}</div>
				) : (
					<>
						<div className="wap-about-info__stats">
							{stats.map((item) => (
								<div key={item.label} className={`wap-about-info-stat wap-about-info-stat--${item.color}`}>
									<span className="wap-about-info-stat__label">{item.label}</span>
									<span className="wap-about-info-stat__value">{item.value}</span>
								</div>
							))}
						</div>
						<div className="wap-about-info__details">
							{details.map((item) => (
								<div key={item.label} className="wap-about-info-detail">
									<span className="wap-about-info-detail__label">{item.label}:</span>
									<span className="wap-about-info-detail__value">{item.value}</span>
								</div>
							))}
						</div>
					</>
				)}
			</div>

			{!whiteLabelBrandingEnabled ? (
				<div className="wap-about-info__section">
					<Title level={5} className="wap-about-info__section-title">
						{sprintf(__('About %s', 'website-accessibility'), brandDisplayName)}
					</Title>
					<Text type="secondary" className="wap-about-info__about-desc">
						{sprintf(
							__(
								'%s helps you enhance your website for all users with customizable toolbars, profiles, and WCAG-oriented features. Improve readability, navigation, and compliance in one place.',
								'website-accessibility'
							),
							brandDisplayName
						)}
					</Text>
					<div className="wap-about-info__actions">
						<WapButton type="primary" href={DOCS_URL} target="_blank" rel="noopener noreferrer" className="wap-about-info__btn">
							<span className="wap-about-info__btn-icon" aria-hidden="true">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
									<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
									<line x1="8" y1="6" x2="16" y2="6" />
									<line x1="8" y1="10" x2="16" y2="10" />
								</svg>
							</span>
							{__('Documentation', 'website-accessibility')}
						</WapButton>
						<WapButton href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="wap-about-info__btn">
							<span className="wap-about-info__btn-icon" aria-hidden="true">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M3 18v-6a9 9 0 0 1 18 0v6" />
									<path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
									<path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
								</svg>
							</span>
							{__('Support', 'website-accessibility')}
						</WapButton>
					</div>
				</div>
			) : null}
		</div>
	);
};

export default AboutInfo;
