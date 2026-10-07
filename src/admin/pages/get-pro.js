import { __ } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';

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

const GetProPage = () => {
  const { WapCard, WapButton, WapTypography } = window?.wapComponents;
  const { Title, Text } = WapTypography;
  const isProPluginActive = typeof window !== 'undefined' && !!window.websacAdmin?.isProPluginActive;

  const upgradeUrl = 'https://oneaccessibility.com/pricing';

  const featuresRows = useMemo(() => ([
    // Core (available in both)
    { label: __('Accessibility widgets (35+)', 'website-accessibility'), free: true, pro: true },
    { label: __('Preset builder (panel, button, header, footer)', 'website-accessibility'), free: true, pro: true },
    { label: __('Regular updates', 'website-accessibility'), free: true, pro: true },

    // Pro accessibility widgets
    { label: __('Screen Reader', 'website-accessibility'), free: false, pro: true },
    { label: __('Smart Contrast', 'website-accessibility'), free: false, pro: true },
    { label: __('Dyslexia Friendly', 'website-accessibility'), free: false, pro: true },
    { label: __('Grayscale', 'website-accessibility'), free: false, pro: true },
    { label: __('Brightness', 'website-accessibility'), free: false, pro: true },
    { label: __('Mute Sounds', 'website-accessibility'), free: false, pro: true },
    { label: __('Keyboard Navigation', 'website-accessibility'), free: false, pro: true },
    { label: __('Virtual Keyboard', 'website-accessibility'), free: false, pro: true },
    { label: __('Skip Links', 'website-accessibility'), free: false, pro: true },
    { label: __('Focus Indicators', 'website-accessibility'), free: false, pro: true },
    { label: __('Voice Navigation', 'website-accessibility'), free: false, pro: true },
    { label: __('Text, Title & Background Color', 'website-accessibility'), free: false, pro: true },
    { label: __('Text Magnifier', 'website-accessibility'), free: false, pro: true },
    { label: __('Highlight Hover', 'website-accessibility'), free: false, pro: true },

    // Pro tools & advanced features
    { label: __('Custom Profiles', 'website-accessibility'), free: false, pro: true },
    { label: __('Accessibility Checker', 'website-accessibility'), free: false, pro: true },
    { label: __('Team Permissions for the Checker', 'website-accessibility'), free: false, pro: true },
    { label: __('Custom Code (CSS, header, body, footer)', 'website-accessibility'), free: false, pro: true },
    { label: __('Compliance Monitoring', 'website-accessibility'), free: false, pro: true },
    { label: __('AI-Powered Fix Suggestions', 'website-accessibility'), free: false, pro: true },
    { label: __('Translation & Consent Options', 'website-accessibility'), free: false, pro: true },
    { label: __('Export / Import Settings (Tools & Backup)', 'website-accessibility'), free: false, pro: true },
    { label: __('White Label', 'website-accessibility'), free: false, pro: true },
    { label: __('Priority Support', 'website-accessibility'), free: false, pro: true },
  ]), []);

  // Highlights the most recent Pro additions. Update this list when Pro ships a
  // notable feature; `isNew` drives the badge, so only the latest release's carry it.
  const whatsNew = useMemo(() => ([
    {
      isNew: true,
      title: __('Highlight Hover', 'website-accessibility'),
      desc: __('A bold frame follows the pointer around the paragraph, link or image under it, so readers never lose their place.', 'website-accessibility'),
    },
    {
      isNew: true,
      title: __('Text Magnifier', 'website-accessibility'),
      desc: __('The text under the pointer, or in keyboard focus, shows enlarged in a box beside it — in three sizes.', 'website-accessibility'),
    },
    {
      isNew: true,
      title: __('Text, Title & Background Color', 'website-accessibility'),
      desc: __('Visitors pick a color for the page text, headings or background from the toolbar, or any custom color; custom profiles can set one too.', 'website-accessibility'),
    },
    {
      title: __('Voice Navigation', 'website-accessibility'),
      desc: __('Browse the page and switch toolbar tools by voice, in about 90 languages.', 'website-accessibility'),
    },
    {
      title: __('Team Permissions', 'website-accessibility'),
      desc: __('Choose which roles can run accessibility scans and which can apply fixes — not only administrators.', 'website-accessibility'),
    },
    {
      title: __('Custom Code', 'website-accessibility'),
      desc: __('Add CSS, header, body or footer snippets from one table — run each on the whole site, only on chosen pages, or everywhere except them.', 'website-accessibility'),
    },
  ]), []);

  const presetControls = useMemo(() => ([
    { area: __('Header', 'website-accessibility'), name: __('Show Translator', 'website-accessibility'), desc: __('Add a language / translation switcher to the panel header.', 'website-accessibility') },
    { area: __('Footer', 'website-accessibility'), name: __('Show Branding', 'website-accessibility'), desc: __('Toggle the branding shown in the panel footer.', 'website-accessibility') },
    { area: __('Panel', 'website-accessibility'), name: __('Items Layout', 'website-accessibility'), desc: __('Switch profiles and features between inline and column layouts.', 'website-accessibility') },
    { area: __('Panel', 'website-accessibility'), name: __('Tooltip Position', 'website-accessibility'), desc: __('Choose where feature tooltips appear in the panel.', 'website-accessibility') },
  ]), []);

  return (
    <div className="wap-get-pro">
      <WapCard className="wap-header-card wap-settings-row wap-get-pro__header" size="small">
        <div className="wap-get-pro__header-copy">
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

      <WapCard className="wap-settings-row wap-get-pro__card wap-get-pro__whats-new" size="small">
        <Title level={4} className="wap-get-pro__section-title">
          {__("WHAT'S NEW IN PRO", 'website-accessibility')}
        </Title>
        <Text type="secondary" className="wap-get-pro__whats-new-note">
          {__('The latest additions to One Accessibility Pro.', 'website-accessibility')}
        </Text>
        <ul className="wap-get-pro__whats-new-list">
          {whatsNew.map((item, idx) => (
            <li className="wap-get-pro__whats-new-item" key={idx}>
              <span className="wap-get-pro__whats-new-title">
                {item.title}
                {item.isNew ? (
                  <span className="wap-get-pro__whats-new-badge">
                    {__('NEW', 'website-accessibility')}
                  </span>
                ) : null}
              </span>
              <span className="wap-get-pro__whats-new-desc">{item.desc}</span>
            </li>
          ))}
        </ul>
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
          {__('PRO CONTROLS IN THE PRESET BUILDER', 'website-accessibility')}
        </Title>
        <Text type="secondary" className="wap-get-pro__controls-note">
          {__('These preset options unlock once One Accessibility Pro is active.', 'website-accessibility')}
        </Text>
        <ul className="wap-get-pro__controls">
          {presetControls.map((control, idx) => (
            <li className="wap-get-pro__control" key={idx}>
              <span className="wap-get-pro__control-area">{control.area}</span>
              <span className="wap-get-pro__control-body">
                <span className="wap-get-pro__control-name">{control.name}</span>
                <span className="wap-get-pro__control-desc">{control.desc}</span>
              </span>
              <span className="wap-get-pro__control-pro">{__('PRO', 'website-accessibility')}</span>
            </li>
          ))}
        </ul>
      </WapCard>

      <WapCard className="wap-settings-row wap-get-pro__card" size="small">
        <div className="wap-get-pro__cta wap-get-pro__cta--standalone">
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

