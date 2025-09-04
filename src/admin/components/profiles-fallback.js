import { __ } from '@wordpress/i18n';
import { Button, Card, Col, Row, Typography } from 'antd';
import { RocketOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const ProfilesFallback = () => {
  return (
    <div className="wap-pro-landing" style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <RocketOutlined style={{ fontSize: 48, color: '#1a4cd8' }} />
        <Title level={2}>{__('Accessibility Custom Profiles', 'website-accessibility')}</Title>
        <Paragraph>
          {__('Apply pre-configured settings in one click. Create your own custom profiles with Pro.', 'website-accessibility')}
        </Paragraph>
        <Button type="primary" size="large" onClick={() => window.open('https://website-accessibility.com/pricing/', '_blank')}>
          {__('Upgrade to Pro to create custom profiles', 'website-accessibility')}
        </Button>
      </div>

      {/* About Custom Profiles / Step Grid */}
      <div style={{ marginBottom: 32 }}>
        <Title level={4}>{__('How Custom Profiles Work', 'website-accessibility')}</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card cover={<img src={'https://placehold.co/100'} alt={__('Create Profile Form', 'website-accessibility')} />}>
              <Title level={5}>{__('Step 1: Create a Profile', 'website-accessibility')}</Title>
              <Paragraph>
                {__('Open the Custom Profiles form and configure your accessibility settings.', 'website-accessibility')}
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card cover={<img src={'https://placehold.co/100'} alt={__('Add Profile to Preset', 'website-accessibility')} />}>
              <Title level={5}>{__('Step 2: Add to Preset', 'website-accessibility')}</Title>
              <Paragraph>
                {__('Save your profile and include it in a preset so it shows alongside default profiles.', 'website-accessibility')}
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card cover={<img src={'https://placehold.co/100'} alt={__('Frontend Profile View', 'website-accessibility')} />}>
              <Title level={5}>{__('Step 3: Apply in Frontend', 'website-accessibility')}</Title>
              <Paragraph>
                {__('Your custom profile appears with default profiles. Users can apply it instantly for an improved experience.', 'website-accessibility')}
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Final CTA */}
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <Button type="primary" size="large" onClick={() => window.open('https://website-accessibility.com/pricing/', '_blank')}>
          {__('Upgrade to Pro and Create Custom Profiles', 'website-accessibility')}
        </Button>
      </div>
    </div>
  );
};

export default ProfilesFallback;
