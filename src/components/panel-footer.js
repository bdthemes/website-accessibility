import { Button, Space } from 'antd';
import { ReloadOutlined, ArrowRightOutlined } from '@ant-design/icons';

const PanelFooter = ({ value, accessibilityContext, accessibilityDispatch }) => {
  const footerItem = value?.items?.find(item => item.slug === 'footer');
  const attributes = footerItem?.attributes || {};

  // Check if we're in frontend context
  const isFrontend = !!accessibilityContext && !!accessibilityDispatch;

  // Reset Button
  const showResetBtn = attributes.showResetBtn !== false;
  const resetBtnText = attributes.resetBtnText || 'Reset All';

  // Save Button
  const showSaveBtn = attributes.showSaveBtn !== false;
  const saveBtnText = attributes.saveBtnText || 'Save Preference';

  // Footer Links
  const showStatement = attributes.showStatement !== false;
  const statementText = attributes.statementText || 'Accessibility Statement';
  const showBranding = attributes.showBranding !== false;
  const brandingText = attributes.brandingText || 'Proudly Powered by Website Accessibility Pro';
  const linkColor = attributes.linkColor || '#0073ea';

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
    <footer className="wap-panel-footer">
      <div className="wap-panel-footer__actions">
          {showResetBtn && (
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
          )}
          {showSaveBtn && (
              <Button
                type="default"
                size="large"
                block
                className="wap-panel-footer__save-btn"
                onClick={handleSave}
              >
                <Space>
                  <span>{saveBtnText}</span>
                  <ArrowRightOutlined />
                </Space>
              </Button>
          )}
      </div>
      
      <div className="wap-panel-footer__links">
        {showStatement && (
          <a
            href="#"
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