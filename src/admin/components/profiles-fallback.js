import { __ } from '@wordpress/i18n';
import { Button, Card, Col, Row, Typography, Layout } from 'antd';  
import { RocketOutlined } from '@ant-design/icons';
import createProfileImage from '../../assets/create-profile.gif';
import addProileImage from '../../assets/add-profile.gif';
import applyProfileImage from '../../assets/apply-profile.gif';
import WapCard from '../../components/wap-card';
import WapButton from '../../components/wap-button';
import WapRow from '../../components/wap-row';

const { Title, Paragraph, Text } = Typography;
const { Space } = Layout;

const ProfilesFallback = () => {
  const openPricingPage = () => {
    window.open('https://oneaccessibility.com#pricing', '_blank');
  };

  return (
    <div className="wap-pro-landing">
      {/* Hero Section */}
      <WapCard className="wap-welcome-card wap-header-card">
        <div className="wap-welcome-card-content">
          <Title level={2} className="wap-header-card-title">
            {__('Accessibility Custom Profiles', 'website-accessibility')}
          </Title>
          <Text className="wap-header-card-description">
            {__('Apply pre-configured settings in one click. Create your own custom profiles with Pro.', 'website-accessibility')}
          </Text>
        </div>
        <div>
          <WapButton
            type="primary"
            size="large"
            onClick={openPricingPage}
           
          >
            {__('Upgrade to Pro', 'website-accessibility')}
            <span className="dashicons dashicons-arrow-right-alt" />
          </WapButton>
        </div>
      </WapCard>

      {/* About Custom Profiles / Step Grid */}
      <div className="profiles-steps">
        <Title level={4} className="profiles-steps-title">
          {__('How Custom Profiles Work', 'website-accessibility')}
        </Title>
        <WapRow gutter={[16, 16]} className="profiles-steps-row">
          <Col xs={24} sm={8}>
            <WapCard 
              cover={
                <img 
                  src={createProfileImage} 
                  alt={__('Create Profile Form', 'website-accessibility')} 
                  className="step-image"
                />
              }
              className="step-card"
            >
              <Title level={5} className="step-title">
                {__('Step 1: Create a Profile', 'website-accessibility')}
              </Title>
              <Paragraph className="step-description">
                {__('Open the Custom Profiles form and configure your accessibility settings.', 'website-accessibility')}
              </Paragraph>
            </WapCard>
          </Col>
          <Col xs={24} sm={8}>
            <WapCard 
              cover={
                <img 
                  src={addProileImage} 
                  alt={__('Add Profile to Preset', 'website-accessibility')}
                  className="step-image"
                />
              }
              className="step-card"
            >
              <Title level={5} className="step-title">
                {__('Step 2: Add to Preset', 'website-accessibility')}
              </Title>
              <Paragraph className="step-description">
                {__('Save your profile and include it in a preset so it shows alongside default profiles.', 'website-accessibility')}
              </Paragraph>
            </WapCard>
          </Col>
          <Col xs={24} sm={8}>
            <WapCard 
              cover={
                <img 
                  src={applyProfileImage} 
                  alt={__('Frontend Profile View', 'website-accessibility')}
                  className="step-image"
                />
              }
              className="step-card"
            >
              <Title level={5} className="step-title">
                {__('Step 3: Apply in Frontend', 'website-accessibility')}
              </Title>
              <Paragraph className="step-description">
                {__('Your custom profile appears with default profiles. Users can apply it instantly for an improved experience.', 'website-accessibility')}
              </Paragraph>
            </WapCard>
          </Col>
        </WapRow>
      </div>
    </div>
  );
};

export default ProfilesFallback;
