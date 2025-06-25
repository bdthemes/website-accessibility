import { Card, Row, Col, Switch } from 'antd';

const features = [
  { label: 'Contrast +', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#1a4cd8" strokeWidth="2" /><path d="M12 2v20" stroke="#1a4cd8" strokeWidth="2" /></svg>
  ) },
  { label: 'Screen Reader', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#1a4cd8" strokeWidth="2" /><path d="M8 12h8" stroke="#1a4cd8" strokeWidth="2" /><path d="M12 8v8" stroke="#1a4cd8" strokeWidth="2" /></svg>
  ) },
  { label: 'Smart Contrast', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="8" stroke="#1a4cd8" strokeWidth="2" /><path d="M4 12h16" stroke="#1a4cd8" strokeWidth="2" /></svg>
  ) },
  { label: 'Highlight Links', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="11" width="16" height="2" fill="#1a4cd8" /><rect x="4" y="17" width="16" height="2" fill="#1a4cd8" /></svg>
  ) },
  { label: 'Bigger Text', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><text x="12" y="18" textAnchor="middle" fontSize="16" fill="#1a4cd8" fontWeight="bold">A</text></svg>
  ) },
  { label: 'Text Spacing', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="8" width="16" height="2" fill="#1a4cd8" /><rect x="4" y="14" width="16" height="2" fill="#1a4cd8" /></svg>
  ) },
  { label: 'Pause Animations', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="6" y="4" width="4" height="16" rx="2" fill="#1a4cd8" /><rect x="14" y="4" width="4" height="16" rx="2" fill="#1a4cd8" /></svg>
  ) },
  { label: 'Hide Images', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="4" stroke="#1a4cd8" strokeWidth="2" /><path d="M4 4l16 16" stroke="#1a4cd8" strokeWidth="2" /></svg>
  ) },
  { label: 'Dyslexia Friendly', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><text x="12" y="18" textAnchor="middle" fontSize="16" fill="#1a4cd8" fontWeight="bold">Df</text></svg>
  ) },
  { label: 'Cursor', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><polygon points="4,4 20,12 13,13 12,20" stroke="#1a4cd8" strokeWidth="2" fill="none" /></svg>
  ) },
  { label: 'Tooltips', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#1a4cd8" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="14" fill="#1a4cd8">i</text></svg>
  ) },
  { label: 'Page Structure', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="4" stroke="#1a4cd8" strokeWidth="2" /><rect x="8" y="8" width="8" height="8" rx="2" stroke="#1a4cd8" strokeWidth="2" /></svg>
  ) },
  { label: 'Line Height', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4" stroke="#1a4cd8" strokeWidth="2" /></svg>
  ) },
  { label: 'Text Align', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="6" width="16" height="2" fill="#1a4cd8" /><rect x="4" y="11" width="10" height="2" fill="#1a4cd8" /><rect x="4" y="16" width="16" height="2" fill="#1a4cd8" /></svg>
  ) },
  { label: 'Saturation', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="8" ry="10" stroke="#1a4cd8" strokeWidth="2" /><ellipse cx="12" cy="12" rx="4" ry="5" fill="#1a4cd8" /></svg>
  ) },
];

const WidgetFeatures = () => (
  <Card className="wap-widget-features">
    <Row align="middle" className="wap-widget-features__row" style={{ marginBottom: 24 }}>
      <Col span={18}>
        <span className="wap-widget-features__badge" style={{ background: 'transparent', color: '#1a4cd8', fontWeight: 600, fontSize: 18 }}>XL</span>
        <span className="wap-widget-features__label">Oversized Widget</span>
      </Col>
      <Col span={6} style={{ textAlign: 'right' }}>
        <Switch checked style={{ background: '#1a4cd8' }} />
      </Col>
    </Row>
    <Row gutter={[16, 16]} className="wap-widget-features__grid">
      {features.map((feature, idx) => (
        <Col xs={24} sm={12} md={8} lg={8} xl={8} key={feature.label}>
          <div className="wap-widget-features__feature-btn">
            <span className="wap-widget-features__feature-icon">{feature.icon}</span>
            {feature.label}
          </div>
        </Col>
      ))}
    </Row>
  </Card>
);

export default WidgetFeatures; 