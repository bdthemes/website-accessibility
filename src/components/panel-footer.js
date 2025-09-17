import { Button, Space } from 'antd';
import { ReloadOutlined, ArrowRightOutlined } from '@ant-design/icons';

const PanelFooter = ({ value, accessibilityContext, accessibilityDispatch }) => {
  const footerItem = value?.items?.find(item => item.slug === 'footer');
  const attributes = footerItem?.attributes || {};

  // Check if we're in frontend context
  const isFrontend = !!accessibilityContext && !!accessibilityDispatch;

  // Reset Button
  const resetBtnText = attributes.resetBtnText || 'Reset All';

  // Save Button
  const showSaveBtn = attributes.showSaveBtn !== false;
  const saveBtnText = attributes.saveBtnText || 'Save Preference';

  // Footer Links
  const showStatement = attributes.showStatement !== false;
  const statementText = attributes.statementText || 'Statement';
  const showBranding = attributes.showBranding !== false;
  const brandingText = attributes.brandingText || 'Powered by Website Accessibility Pro';
  const linkColor = attributes.linkColor || '#0073ea';

  const footerStyle = {
    '--wap-footer-general-bg': attributes.generalBg,
    '--wap-footer-general-padding': attributes.generalPadding,
    '--wap-footer-general-radius': attributes.generalRadius,
    '--wap-footer-reset-btn-bg': attributes.resetBtnBg,
    '--wap-footer-reset-btn-color': attributes.resetBtnColor,
    '--wap-footer-reset-btn-radius': attributes.resetBtnRadius,
    '--wap-footer-link-color': attributes.linkColor,
    '--wap-footer-branding-color': attributes.brandingColor,
  };

  // Handle reset action
  const handleReset = () => {
    if (!isFrontend) return;

    accessibilityDispatch({
      type: 'RESET_ACCESSIBILITY',
    });
  };

  // Handle save action
  const handleSave = () => {
    if (!isFrontend) return;
  };

  return (
    <footer className="wap-panel-footer" style={footerStyle}>
      <div className="wap-panel-footer__actions">
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          size="large"
          block
          className="wap-panel-footer__reset-btn"

          onClick={handleReset}
        >
          {resetBtnText}
        </Button>

      </div>

      <div className="wap-panel-footer__links">

        {showBranding && (
          <div className="wap-panel-footer__branding">
            <div className="wap-panel-footer__brand-left-text">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24.0557 37.04C24.4857 40.37 25.3357 43.4902 26.5557 46.1602H21.5557C22.7757 43.4902 23.6257 40.37 24.0557 37.04ZM31.3262 2C32.066 2.00014 32.7256 2.46026 32.9756 3.16016L46.0459 43.8096L46.0361 43.7803C46.4458 44.9202 45.5956 46.1299 44.3857 46.1299H31.9658C31.9458 46.0799 31.9255 46.0402 31.8955 45.9902C30.0355 42.8902 28.8257 38.45 28.5957 33.79C28.5157 32.02 28.5561 30.2698 28.7461 28.5898C31.026 28.2898 33.1961 27.7602 35.166 27.0303C36.4158 26.5703 37.0456 25.1903 36.5859 23.9404C36.126 22.6906 34.746 22.0598 33.4961 22.5195C30.6961 23.5595 27.3657 24.1104 23.8857 24.1104C20.4058 24.1103 17.156 23.5696 14.376 22.5596C13.126 22.1096 11.7462 22.7501 11.2861 24C10.8362 25.2499 11.4758 26.6297 12.7256 27.0898C14.7556 27.8298 17.016 28.3504 19.376 28.6504C19.5559 30.3201 19.6056 32.0499 19.5156 33.8096C19.2856 38.4695 18.0758 42.9098 16.2158 46.0098L16.1455 46.1504H3.75586C2.5559 46.1504 1.70579 44.97 2.0957 43.8301L14.5361 3.19043C14.7761 2.48043 15.4463 2 16.1963 2H31.3262ZM27.7559 18.3301C27.5559 16.3001 25.7458 14.8196 23.7158 15.0195C21.6859 15.2195 20.2065 17.0297 20.4062 19.0596C20.6063 21.0896 22.4163 22.5701 24.4463 22.3701C26.476 22.1699 27.9558 20.3599 27.7559 18.3301Z" fill="url(#paint0_linear_258_14)" />
                <defs>
                  <linearGradient id="paint0_linear_258_14" x1="13" y1="3" x2="43" y2="44.5" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#007BFF" />
                    <stop offset="1" stop-color="#005A9C" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="wap-panel-footer__brand-text">
                {brandingText}
              </span>
            </div>

            {showStatement && (
              <a
                onClick={() => window.open('#', '_blank')}

                className="wap-panel-footer__statement-link"
              >
                {statementText}
              </a>
            )}
          </div>
        )}
      </div>
    </footer>
  );
};

export default PanelFooter; 