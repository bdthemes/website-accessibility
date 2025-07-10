import { Card, Row, Col, Switch } from 'antd';
import { useState } from '@wordpress/element';
import { features } from '../utils';
import clsx from 'clsx';

const WidgetFeatures = ({ value, onChange, accessibilityContext }) => {
    const { items } = value;
    const featureItem = items.find(item => item.slug === 'features');
    const attributes = featureItem?.attributes || {};
    
    // Check if we're in frontend context
    const isFrontend = !!accessibilityContext;
    const { settings, updateSetting } = accessibilityContext || {};
    
    
    // Use context settings in frontend, widget value settings in editor
    const currentSettings = isFrontend ? settings : (value?.settings || {});
    const [isOverSized, setIsOverSized] = useState(false);

    // Calculate column span based on items per row
    const itemsPerRow = parseInt(attributes?.itemsPerRow) || 3;
    const colSpan = 24 / itemsPerRow;

    // Handle feature click
    const handleFeatureClick = (feature) => {
        const currentValue = currentSettings[feature.key];
        const currentIndex = feature.attributes.findIndex(attr => attr.value === currentValue);
        
        let newValue = null;
        
        // Check if this is enable/disable feature
        const isEnableDisable = feature.attributes.length === 2 && 
            feature.attributes.every(attr => ['enable', 'disable'].includes(attr.value));
        
        if (isEnableDisable) {
            // Enable/Disable logic: simple toggle
            if (currentIndex === -1) {
                newValue = 'enable'; // Activate
            } else {
                newValue = null; // Deactivate
            }
        } else {
            // Multiple options logic: cycle through
            if (currentIndex === -1) {
                newValue = feature.attributes[0].value; // First option
            } else if (currentIndex < feature.attributes.length - 1) {
                newValue = feature.attributes[currentIndex + 1].value; // Next option
            } else {
                newValue = null; // Deactivate
            }
        }
        
        if (isFrontend && updateSetting) {
            updateSetting(feature.key, newValue);
        } else if (onChange) {
            const newSettings = { ...currentSettings, [feature.key]: newValue };
            onChange(newSettings);
        }
    };



    // Handle oversized toggle
    const handleOversizedToggle = (checked) => {
        setIsOverSized(checked);
        if (isFrontend && updateSetting) {
            updateSetting('oversized', checked);
        } else if (onChange) {
            onChange({ ...currentSettings, oversized: checked });
        }
    };

    // Get feature status
    const getFeatureStatus = (feature) => {
        const currentValue = currentSettings[feature.key];
        const currentIndex = feature.attributes.findIndex(attr => attr.value === currentValue);
        const isActive = currentIndex >= 0;
        const currentAttribute = isActive ? feature.attributes[currentIndex] : null;
        
        // Only show steps if there are more than 2 options (not just enable/disable)
        const showSteps = feature.attributes.length > 2;
        
        return {
            isActive,
            currentAttribute,
            currentStep: currentIndex + 1,
            totalSteps: feature.attributes.length,
            showSteps
        };
    };
    
    return (
        <Card className="wap-widget-features">
            {!attributes?.hideOversizedWidget && (
                <Row align="middle" className="wap-widget-features__row wap-widget-features__row--oversized">
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
                {features.map((feature, idx) => {
                    const { isActive, currentAttribute, currentStep, totalSteps, showSteps } = getFeatureStatus(feature);
                    
                    return (
                        <Col 
                            className={clsx(
                                { [`wap-feature-${feature.key}`]: !!feature.key },
                                { 'wap-feature--active': isActive }
                            )} 
                            xs={24} 
                            sm={12} 
                            md={colSpan} 
                            lg={colSpan} 
                            xl={colSpan} 
                            key={feature.key}
                        >
                            {/* Top indicator - only show when active */}
                            {isActive && (
                                <span className="wap-widget-features-top-indicator wap-widget-features-top-indicator--active">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                                    </svg>
                                </span>
                            )}
                            
                            <div 
                                className={`wap-widget-features__feature-btn ${isActive ? 'wap-widget-features__feature-btn--active' : ''}`}
                                onClick={() => handleFeatureClick(feature)}
                                style={{ cursor: 'pointer' }}
                            >
                                {!attributes?.hideItemIcons && (
                                    <span className="wap-widget-features__feature-icon">{feature.icon}</span>
                                )}
                                {!attributes?.hideItemLabels && feature.label}
                            </div>
                            
                            {/* Bottom indicator - only show for multi-step features */}
                            {showSteps && isActive && currentAttribute && (
                                <span className={clsx(
                                    "wap-widget-features-bottom-indicator",
                                    { "wap-widget-features-bottom-indicator--active": isActive }
                                )}>
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