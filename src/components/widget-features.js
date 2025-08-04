import { Card, Row, Col, Switch } from 'antd';
import { features, isScreenReaderActive } from '../utils';
import clsx from 'clsx';
import screenReader from '../screen-reader';

const WidgetFeatures = ({ value, accessibilityContext, accessibilityDispatch }) => {
    const { items } = value;
    const featureItem = items.find(item => item.slug === 'features');
    const attributes = featureItem?.attributes || {};

    // Check if we're in frontend context
    const isFrontend = !!accessibilityContext && !!accessibilityDispatch;
    const { currentSettings, isOverSized } = accessibilityContext || {};

    // Calculate column span based on items per row
    const itemsPerRow = parseInt(attributes?.itemsPerRow) || 3;
    const colSpan = 24 / itemsPerRow;
    // Handle feature click
    const handleFeatureClick = (feature) => {
        if (!isFrontend) return;

        const allAttributes = feature.attributes || [];
        const key = feature?.key;

        const prevState = currentSettings[key] || {};
        const prevStep = prevState?.currentStep || 0;

        accessibilityDispatch({
            type: 'SET_CURRENT_PROFILE',
            payload: null, // Reset current profile on feature click
        });

        // For toggle-like features (enable/disable)
        if (allAttributes.length === 2 && allAttributes[0]?.value === 'enable') {
            const nextStep = prevStep === 1 ? 0 : 1;
            const currentAttribute = allAttributes[nextStep - 1] || null;

            accessibilityDispatch({
                type: 'SET_CURRENT_SETTINGS',
                payload: {
                    ...currentSettings,
                    [key]: {
                        currentStep: nextStep,
                        currentAttribute,
                        isMultiStep: false,
                    },
                },
            });

            if (isScreenReaderActive(currentSettings)) {
                const enableAnnouncement = currentAttribute?.enableAnnouncement;
                const disableAnnouncement = feature?.disableAnnouncement;
                if (currentAttribute) {
                    screenReader().speak(enableAnnouncement);
                } else {
                    screenReader().speak(disableAnnouncement);
                }
            }

            return;
        }

        // For multi-step attributes
        const nextStep = prevStep >= allAttributes.length ? 0 : prevStep + 1;

        accessibilityDispatch({
            type: 'SET_CURRENT_SETTINGS',
            payload: {
                ...currentSettings,
                [key]: {
                    currentStep: nextStep,
                    currentAttribute: nextStep === 0 ? null : allAttributes[nextStep - 1],
                    isMultiStep: allAttributes.length > 1,
                },
            },
        });

        if (isScreenReaderActive(currentSettings)) {
            const enableAnnouncement = allAttributes[nextStep - 1]?.enableAnnouncement;
            const disableAnnouncement = feature?.disableAnnouncement;
            if (allAttributes[nextStep - 1]) {
                if(key === 'screenReader'){
                    screenReader().screenReaderConfig = {
                        rate: allAttributes[nextStep - 1]?.rate || 1,
                        pitch: allAttributes[nextStep - 1]?.pitch || 1,
                        lang: allAttributes[nextStep - 1]?.lang || 'en-US',
                        voiceURI: allAttributes[nextStep - 1]?.voiceURI || null,
                    }
                }
                screenReader().speak(enableAnnouncement);
            } else {
                screenReader().speak(disableAnnouncement);
            }
        } else if (key === 'screenReader') {
            const enableAnnouncement = allAttributes[0]?.enableAnnouncement;
            screenReader().screenReaderConfig = {
                rate: allAttributes[0]?.rate || 1,
                pitch: allAttributes[0]?.pitch || 1,
                lang: allAttributes[0]?.lang || 'en-US',
                voiceURI: allAttributes[0]?.voiceURI || null,
            }
            screenReader().speak(enableAnnouncement);
        }
    };

    // Handle oversized toggle
    const handleOversizedToggle = (checked) => {
        if (!isFrontend) return;

        accessibilityDispatch({
            type: 'SET_OVERSIZED',
            payload: checked,
        });
    };

    return (
        <Card className="wap-widget-features">
            {!attributes?.hideOversizedWidget && (
                <Row
                    align="middle"
                    className="wap-widget-features__row wap-widget-features__row--oversized"
                >
                    <Col span={18}>
                        {!attributes?.hideHeaderIcon && (
                            <span className="wap-widget-features__badge">XL</span>
                        )}
                        {!attributes?.hideHeaderTitle && (
                            <span className="wap-widget-features__label">
                                {attributes?.oversizedTitle || 'Oversized Widget'}
                            </span>
                        )}
                    </Col>
                    <Col span={6} style={{ textAlign: 'right' }}>
                        <Switch
                            checked={isOverSized}
                            onChange={handleOversizedToggle}
                        />
                    </Col>
                </Row>
            )}

            <Row gutter={[16, 16]} className="wap-widget-features__grid">
                {features.map((feature) => {
                    const key = feature.key;
                    const setting = currentSettings?.[key] || {};
                    const currentStep = setting.currentStep || 0;
                    const currentAttribute = setting.currentAttribute;
                    const allAttributes = feature.attributes || [];
                    const isActive = currentStep > 0;
                    const showSteps = currentStep > 0 && allAttributes[0]?.value !== 'enable';
                    const totalSteps = allAttributes.length;

                    return (
                        <Col
                            key={key}
                            className={clsx(
                                `wap-feature-${key}`,
                                { 'wap-feature--active': isActive }
                            )}
                            xs={24}
                            sm={12}
                            md={colSpan}
                            lg={colSpan}
                            xl={colSpan}
                        >
                            {/* Top active checkmark */}
                            {isActive && (
                                <span className="wap-widget-features-top-indicator wap-widget-features-top-indicator--active">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                </span>
                            )}

                            {/* Feature button */}
                            <div
                                className={clsx(
                                    'wap-widget-features__feature-btn',
                                    { 'wap-widget-features__feature-btn--active': isActive }
                                )}
                                onClick={() => handleFeatureClick(feature)}
                                style={{ cursor: 'pointer' }}
                                aria-label={currentAttribute?.description || feature?.description}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        handleFeatureClick(feature);
                                    }
                                }}
                            >
                                {!attributes?.hideItemIcons && (
                                    <span className="wap-widget-features__feature-icon">
                                        {feature.icon}
                                    </span>
                                )}
                                {!attributes?.hideItemLabels && (
                                    <span className="wap-widget-features__feature-label">
                                        {feature.label}
                                    </span>
                                )}
                            </div>

                            {/* Bottom step indicator */}
                            {showSteps && isActive && currentAttribute && (
                                <span className="wap-widget-features-bottom-indicator wap-widget-features-bottom-indicator--active">
                                    <span className="wap-widget-features-bottom-indicator__text">
                                        {currentAttribute.name}
                                        <span className="wap-widget-features-bottom-indicator__step">
                                            ({currentStep}/{totalSteps})
                                        </span>
                                    </span>
                                </span>
                            )}
                        </Col>
                    );
                })}
            </Row>
        </Card>

    );
};

export default WidgetFeatures; 