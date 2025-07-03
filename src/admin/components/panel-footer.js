import { Button, Row, Col, Space } from 'antd';
import { ReloadOutlined, SaveOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useSelect } from '@wordpress/data';
import { STORE_NAME } from '../store';

const PanelFooter = ({ value }) => {
  const footerItem = value?.items?.find(item => item.slug === 'footer');
  const attributes = footerItem?.attributes || {};

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

  return (
    <div className="wap-panel-customization__footer">
      <Row gutter={[0, 16]} justify="center">
        {showResetBtn && (
          <Col span={24}>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              size="large"
              block
              style={{
                fontWeight: 600,
                fontSize: 20,
                borderRadius: resetBtnRadius,
                background: resetBtnBg,
                color: resetBtnColor,
                border: 'none',
              }}
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
              style={{
                fontWeight: 600,
                fontSize: 18,
                borderRadius: saveBtnRadius,
                background: saveBtnBg,
                color: saveBtnColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: 'none',
              }}
            >
              <Space style={{ width: '100%', justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
                <span>{saveBtnText}</span>
                <ArrowRightOutlined style={{ color: saveBtnArrowColor, fontSize: 18 }} />
              </Space>
            </Button>
          </Col>
        )}
      </Row>
      <div style={{ marginTop: 24, textAlign: 'center' }}>
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