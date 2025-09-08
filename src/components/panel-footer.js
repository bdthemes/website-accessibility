import { Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const PanelFooter = ({ value, accessibilityContext, accessibilityDispatch }) => {
  const footerItem = value?.items?.find(item => item.slug === 'footer');
  const attributes = footerItem?.attributes || {};

  // Check if we're in frontend context
  const isFrontend = !!accessibilityContext && !!accessibilityDispatch;

  // Reset Button
  const resetBtnText = attributes.resetBtnText || 'Reset All';

  // Footer Links
  const showStatement = attributes.showStatement !== false;
  const statementText = attributes.statementText || 'Accessibility Statement';
  const showBranding = attributes.showBranding !== false;
  const brandingText = attributes.brandingText || 'Proudly Powered by Website Accessibility Pro';
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
        {showStatement && (
          <a
            href={attributes?.statementLink}
            target="_blank"
            rel="noopener noreferrer"
            className="wap-panel-footer__statement-link"
            style={{ color: linkColor }}
          >
            {statementText}
          </a>
        )}
        {showBranding && (
          <div className="wap-panel-footer__branding">
            <span className="wap-panel-footer__brand-text">
              {brandingText}
            </span>
          </div>
        )}
      </div>
    </footer>
  );
};

export default PanelFooter; 