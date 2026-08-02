import { __ } from '@wordpress/i18n';
import { useLicense } from '../context/LicenseContext';
import ComplianceOverview from '../components/compliance-overview';

/**
 * Standalone Compliance Monitoring admin page.
 */
const ComplianceMonitoring = () => {
	const { WapCard, WapTypography } = window?.wapComponents || {};
	const { Title, Text } = WapTypography || {};
	const { isProPluginActive, isProActive } = useLicense();
	const hasCompliancePage = !!window?.websacAdmin?.hasFixedIssuesPage;

	if (!WapCard || !Title) {
		return null;
	}

	if (!isProPluginActive || !isProActive || !hasCompliancePage) {
		return (
			<div className="wap-settings wap-compliance-page">
				<WapCard className="wap-settings-row">
					<Title level={4} className="wap-header-card-title">
						{__('Compliance Monitoring', 'website-accessibility')}
					</Title>
					<Text type="secondary" className="wap-header-card-description">
						{__(
							'Available in Pro when Accessibility Checker is enabled.',
							'website-accessibility'
						)}
					</Text>
				</WapCard>
			</div>
		);
	}

	return (
		<div className="wap-settings wap-dashboard wap-compliance-page">
			<ComplianceOverview />
		</div>
	);
};

export default ComplianceMonitoring;
