import { __ } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';
import { useLicense } from '../context/LicenseContext';

const CheckIcon = () => (
  <span className="wap-get-pro__cell-icon wap-get-pro__cell-icon--yes" aria-hidden="true">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  </span>
);

const CrossIcon = () => (
  <span className="wap-get-pro__cell-icon wap-get-pro__cell-icon--no" aria-hidden="true">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  </span>
);

const SmallFeatureIcon = ({ type }) => {
  const common = {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    width: 18,
    height: 18,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  switch (type) {
    case 'bolt':
      return (
        <svg {...common}>
          <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
        </svg>
      );
    case 'support':
      return (
        <svg {...common}>
          <path d="M4 10V7a8 8 0 0 1 16 0v3" />
          <path d="M4 10a2 2 0 0 0-2 2v1a3 3 0 0 0 3 3h1" />
          <path d="M20 10a2 2 0 0 1 2 2v1a3 3 0 0 1-3 3h-1" />
          <path d="M12 22a4 4 0 0 0 4-4h-4" />
        </svg>
      );
    case 'chat':
      return (
        <svg {...common}>
          <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
        </svg>
      );
    case 'refund':
      return (
        <svg {...common}>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 3v6h6" />
        </svg>
      );
    case 'plugins':
      return (
        <svg {...common}>
          <path d="M8 2v6" />
          <path d="M16 2v6" />
          <path d="M7 8h10" />
          <path d="M12 8v14" />
          <path d="M7 22h10" />
        </svg>
      );
    case 'content':
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M4 12h10" />
          <path d="M4 17h16" />
        </svg>
      );
    case 'widgets':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case 'discount':
      return (
        <svg {...common}>
          <path d="M19 5 5 19" />
          <circle cx="7" cy="7" r="2" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      );
    case 'effects':
      return (
        <svg {...common}>
          <path d="M12 2v4" />
          <path d="M12 18v4" />
          <path d="M4.93 4.93 7.76 7.76" />
          <path d="M16.24 16.24 19.07 19.07" />
          <path d="M2 12h4" />
          <path d="M18 12h4" />
          <path d="M4.93 19.07 7.76 16.24" />
          <path d="M16.24 7.76 19.07 4.93" />
        </svg>
      );
    case 'tutorial':
    default:
      return (
        <svg {...common}>
          <path d="m22 8-10 6L2 8" />
          <path d="M2 8v10l10 6 10-6V8" />
        </svg>
      );
  }
};

const GetProPage = () => {
  const { WapCard, WapButton, WapTypography } = window?.wapComponents;
  const { Title, Text } = WapTypography;
  const { isProPluginActive } = useLicense();

  const upgradeUrl = (typeof window !== 'undefined' && window.websacAdmin?.proUpgradeUrl)
    ? window.websacAdmin.proUpgradeUrl
    : 'https://oneaccessibility.com#pricing';

  const featuresRows = useMemo(() => ([
    { label: __('Accessibility widgets (35+)', 'website-accessibility'), free: true, pro: true },
    { label: __('Preset builder (panel, button, header, footer)', 'website-accessibility'), free: true, pro: true },
    { label: __('Custom Profiles', 'website-accessibility'), free: false, pro: true },
    { label: __('Export / Import settings (Tools & Backup)', 'website-accessibility'), free: false, pro: true },
    { label: __('White Label', 'website-accessibility'), free: false, pro: true },
    { label: __('Screen reader, smart contrast & other Pro widgets', 'website-accessibility'), free: false, pro: true },
    { label: __('Translation & consent options', 'website-accessibility'), free: false, pro: true },
    { label: __('Accessibility checker', 'website-accessibility'), free: false, pro: true },
    { label: __('Priority support', 'website-accessibility'), free: false, pro: true },
    { label: __('Regular updates', 'website-accessibility'), free: true, pro: true },
  ]), []);

  const included = useMemo(() => ([
    { icon: 'widgets', label: __('Pro widgets & controls', 'website-accessibility') },
    { icon: 'content', label: __('Advanced customization options', 'website-accessibility') },
    { icon: 'plugins', label: __('Import / Export + backups', 'website-accessibility') },
    { icon: 'effects', label: __('More UI presets & layouts', 'website-accessibility') },
    { icon: 'support', label: __('Premium support', 'website-accessibility') },
    { icon: 'chat', label: __('Priority assistance', 'website-accessibility') },
    { icon: 'bolt', label: __('Faster workflow tools', 'website-accessibility') },
    { icon: 'discount', label: __('Pro-only deals', 'website-accessibility') },
  ]), []);

  return (
    <div className="wap-get-pro">
      <WapCard className="wap-header-card wap-settings-row wap-get-pro__header" size="small">
        <div>
          <Title level={3} className="wap-header-card-title">
            {__('Get Pro', 'website-accessibility')}
          </Title>
          <Text type="secondary" className="wap-header-card-description">
            {__('Compare Free vs Pro and unlock custom profiles, backups, white label, translation, the accessibility checker, and priority support.', 'website-accessibility')}
          </Text>
        </div>
        <div className="wap-get-pro__header-actions">
          <a href={upgradeUrl} target="_blank" rel="noopener noreferrer">
            <WapButton type="primary">
              {__('View Pricing', 'website-accessibility')}
            </WapButton>
          </a>
        </div>
      </WapCard>

      <div className="wap-get-pro__comparison">
        <div className="wap-get-pro__comparison-head">
          <div className="wap-get-pro__comparison-col wap-get-pro__comparison-col--feature">
            {__('FEATURES', 'website-accessibility')}
          </div>
          <div className="wap-get-pro__comparison-col wap-get-pro__comparison-col--free">
            {__('Free', 'website-accessibility')}
          </div>
          <div className="wap-get-pro__comparison-col wap-get-pro__comparison-col--pro">
            <span className="wap-get-pro__pro-pill">{__('Pro', 'website-accessibility')}</span>
          </div>
        </div>

        <div className="wap-get-pro__comparison-body">
          {featuresRows.map((row, idx) => (
            <div className="wap-get-pro__row" key={idx}>
              <div className="wap-get-pro__cell wap-get-pro__cell--feature">
                {row.label}
              </div>
              <div className="wap-get-pro__cell wap-get-pro__cell--free">
                {row.free ? <CheckIcon /> : <CrossIcon />}
              </div>
              <div className="wap-get-pro__cell wap-get-pro__cell--pro">
                {row.pro ? <CheckIcon /> : <CrossIcon />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <WapCard className="wap-settings-row wap-get-pro__card" size="small">
        <Title level={4} className="wap-get-pro__section-title">
          {__("WHAT'S INCLUDED WITH PRO", 'website-accessibility')}
        </Title>
        <div className="wap-get-pro__included-grid">
          {included.map((item, idx) => (
            <div className="wap-get-pro__included-item" key={idx}>
              <span className="wap-get-pro__included-icon" aria-hidden="true">
                <SmallFeatureIcon type={item.icon} />
              </span>
              <span className="wap-get-pro__included-label">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="wap-get-pro__cta">
          <div className="wap-get-pro__cta-text">
            <Title level={5} className="wap-get-pro__cta-title">
              {__('Ready to unlock all Pro features?', 'website-accessibility')}
            </Title>
            <Text type="secondary" className="wap-get-pro__cta-subtitle">
              {__('Choose the plan that fits your site and start improving accessibility today.', 'website-accessibility')}
            </Text>
          </div>
          <a href={upgradeUrl} target="_blank" rel="noopener noreferrer">
            <WapButton type="primary" size="large">
              {__('Get Pro', 'website-accessibility')}
            </WapButton>
          </a>
        </div>
      </WapCard>
    </div>
  );
};

export default GetProPage;

