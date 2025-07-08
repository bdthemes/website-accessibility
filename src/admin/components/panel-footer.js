import { Button, Row, Col, Space } from 'antd';
import { ReloadOutlined, SaveOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useSelect } from '@wordpress/data';
import { STORE_NAME } from '../store';

const PanelFooter = ({ value }) => {
  const footerItem = value?.items?.find(item => item.slug === 'footer');
  const attributes = footerItem?.attributes || {};

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
  const brandingColor = attributes.brandingColor || '#1a4cd8';

  return (
    <div className="wap-panel-customization__footer">
      <div className="wap-panel-customization__footer-buttons">
        {showResetBtn && (
            <Button
              type="primary" danger
              icon={<ReloadOutlined />}
              size="large"
              block
            >
              {resetBtnText}
            </Button>
        )}
        {showSaveBtn && (
            <Button
              type="primary"
              size="large"
              block
            >
              
                <span>{saveBtnText}</span>
                <ArrowRightOutlined />
            </Button>
        )}
      </div>
      <div style={{ marginTop: 15, textAlign: 'center' }}>
        {showStatement && (
          <span
            className="wap-panel-customization__footer-link"
            style={{ display: 'block', marginBottom: 8, color: linkColor }}
          >
            {statementText}
          </span>
        )}
        {showBranding && (
          <span
            className="wap-panel-customization__footer-brand"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: brandingColor }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="6" fill={brandingColor} />
              <text x="12" y="17" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="bold">U</text>
            </svg>
            <span>{brandingText}</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default PanelFooter; 