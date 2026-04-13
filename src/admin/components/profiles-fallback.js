import { __ } from '@wordpress/i18n';

const VIDEO_URL = 'https://www.youtube.com/embed/HEpilnKaVoE?start=175&autoplay=1&mute=1';

const ProfilesFallback = () => {
  const { WapCard, WapButton, WapTypography } = window?.wapComponents;
  const { Title, Text, Paragraph } = WapTypography;

  const openPricingPage = () => {
    window.open('https://oneaccessibility.com#pricing', '_blank');
  };

  return (
    <div className="wap-pro-landing">
      <WapCard className="wap-header-card">
        <div className="wap-welcome-card-content">
          <Title level={4} className="wap-header-card-title">
            {__('Accessibility Custom Profiles', 'website-accessibility')}
          </Title>
          <Text type="secondary" className="wap-header-card-description">
            {__('Apply pre-configured settings in one click. Create your own custom profiles with Pro.', 'website-accessibility')}
          </Text>
        </div>
        <div>
          <WapButton type="default" onClick={openPricingPage}>
            {__('Upgrade to Pro', 'website-accessibility')}
            <span className="dashicons dashicons-arrow-right-alt" />
          </WapButton>
        </div>
      </WapCard>

      <WapCard className="wap-settings-row profiles-steps-wrap">
        <div className="profiles-steps">
          <Title level={4} className="profiles-steps-title">
            {__('How Custom Profiles Work', 'website-accessibility')}
          </Title>
          <Paragraph className="profiles-steps-description">
            {__('Watch the video below to learn how to create, add, and apply custom accessibility profiles on your website.', 'website-accessibility')}
          </Paragraph>
          <div className="profiles-video-wrapper">
            <iframe
              src={VIDEO_URL}
              title={__('How Custom Profiles Work', 'website-accessibility')}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </WapCard>
    </div>
  );
};

export default ProfilesFallback;
