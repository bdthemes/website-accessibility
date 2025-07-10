import { Button, Row, Col, Space } from 'antd';
import { ReloadOutlined, SaveOutlined, ArrowRightOutlined } from '@ant-design/icons';

const PanelFooter = ({ value, onChange, accessibilityContext }) => {
  const footerItem = value?.items?.find(item => item.slug === 'footer');
  const attributes = footerItem?.attributes || {};

  // Check if we're in frontend context
  const isFrontend = !!accessibilityContext;
  const { resetAll, savePreferences } = accessibilityContext || {};

  // Reset Button
  const showResetBtn = attributes.showResetBtn !== false;
  const resetBtnText = attributes.resetBtnText || 'Reset All Accessibility Settings';
  const resetBtnBg = attributes.resetBtnBg || '#0073ea';
  const resetBtnColor = attributes.resetBtnColor || '#fff';
  const resetBtnRadius = attributes.resetBtnRadius || 16;

  // Save Button
  const showSaveBtn = attributes.showSaveBtn !== false;
  const saveBtnText = attributes.saveBtnText || 'Save Preference';
  const saveBtnBg = attributes.saveBtnBg || '#fff';
  const saveBtnColor = attributes.saveBtnColor || '#111';
  const saveBtnRadius = attributes.saveBtnRadius || 50;
  const saveBtnIconColor = attributes.saveBtnIconColor || '#0073ea';
  const saveBtnArrowColor = attributes.saveBtnArrowColor || '#888';

  // Footer Links
  const showStatement = attributes.showStatement !== false;
  const statementText = attributes.statementText || 'Accessibility Statement';
  const showBranding = attributes.showBranding !== false;
  const brandingText = attributes.brandingText || 'Proudly Powered by Website Accessibility Pro';
  const linkColor = attributes.linkColor || '#0073ea';
  const brandingColor = attributes.brandingColor || '#1a4cd8';

  // Handle reset action
  const handleReset = () => {
    if (isFrontend && resetAll) {
      // In frontend: use context reset
      resetAll();
      console.log('Reset all settings in frontend');
    } else if (onChange) {
      // In editor: call onChange with reset action
      onChange({ action: 'reset' });
      console.log('Reset action triggered in editor');
    }
  };

  // Handle save action
  const handleSave = () => {
    if (isFrontend && savePreferences) {
      // In frontend: use context save
      const success = savePreferences();
      if (success) {
        console.log('Saved preferences in frontend');
      } else {
        console.error('Failed to save preferences in frontend');
      }
    } else if (onChange) {
      // In editor: call onChange with save action
      onChange({ action: 'save' });
      console.log('Save action triggered in editor');
    }
  };

  return (
    <footer className="wap-panel-footer">
      <div className="wap-panel-footer__actions">
        <Row gutter={[0, 12]} justify="center">
          {showResetBtn && (
            <Col span={24}>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                size="large"
                block
                className="wap-panel-footer__reset-btn"
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  borderRadius: resetBtnRadius,
                  background: resetBtnBg,
                  color: resetBtnColor,
                  border: 'none',
                  height: 56,
                  boxShadow: '0 4px 12px rgba(0, 115, 234, 0.3)',
                  transition: 'all 0.3s ease',
                }}
                onClick={handleReset}
              >
                {resetBtnText}
              </Button>
            </Col>
          )}
          {showSaveBtn && (
            <Col span={24}>
              <Button
                type="default"
                icon={<SaveOutlined style={{ color: saveBtnIconColor }} />}
                size="large"
                block
                className="wap-panel-footer__save-btn"
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  borderRadius: saveBtnRadius,
                  background: saveBtnBg,
                  color: saveBtnColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '2px solid #f0f0f0',
                  height: 56,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.3s ease',
                }}
                onClick={handleSave}
              >
                <Space style={{ width: '100%', justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
                  <span>{saveBtnText}</span>
                  <ArrowRightOutlined style={{ color: saveBtnArrowColor, fontSize: 16 }} />
                </Space>
              </Button>
            </Col>
          )}
        </Row>
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
            <div className="wap-panel-footer__brand-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="6" fill={brandingColor} />
                <text x="12" y="17" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="bold">U</text>
              </svg>
            </div>
            <span className="wap-panel-footer__brand-text" style={{ color: brandingColor }}>
              {brandingText}
            </span>
          </div>
        )}
      </div>
    </footer>
  );
};

export default PanelFooter; 