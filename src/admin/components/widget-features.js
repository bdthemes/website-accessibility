import { Card, Row, Col, Switch } from 'antd';
import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { STORE_NAME } from '../store';
import { features } from '../utils';

const WidgetFeatures = ({ value }) => {
    const { items } = value;
    const featureItem = items.find(item => item.slug === 'features');
    const attributes = featureItem?.attributes || {};
    
    // Get CSS variables from settings
    const cssVariables = useMemo(() => {
        const vars = {};
        
        // General styling
        attributes.backgroundColor && (vars['--wap-features-background-color'] = attributes.backgroundColor);
        attributes.padding && (vars['--wap-features-padding'] = attributes.padding);
        attributes.margin && (vars['--wap-features-margin'] = attributes.margin);
        attributes.border && (vars['--wap-features-border'] = attributes.border);
        attributes.borderRadius && (vars['--wap-features-border-radius'] = attributes.borderRadius);
        
        // Header styling
        attributes.headerPadding && (vars['--wap-features-header-padding'] = attributes.headerPadding);
        attributes.headerMargin && (vars['--wap-features-header-margin'] = attributes.headerMargin);
        attributes.headerBorder && (vars['--wap-features-header-border'] = attributes.headerBorder);
        attributes.headerBorderRadius && (vars['--wap-features-header-border-radius'] = attributes.headerBorderRadius);
        attributes.headerSpaceBetweenIconAndTitle && (vars['--wap-features-header-space-between-icon-and-title'] = `${attributes.headerSpaceBetweenIconAndTitle}px`);
        attributes.headerTitleFontSize && (vars['--wap-features-header-title-font-size'] = `${attributes.headerTitleFontSize}px`);
        attributes.headerTitleFontWeight && (vars['--wap-features-header-title-font-weight'] = attributes.headerTitleFontWeight);
        attributes.headerTitleTextColor && (vars['--wap-features-header-title-text-color'] = attributes.headerTitleTextColor);
        attributes.headerIconSize && (vars['--wap-features-header-icon-size'] = `${attributes.headerIconSize}px`);
        attributes.headerIconColor && (vars['--wap-features-header-icon-color'] = attributes.headerIconColor);
        
        // Items styling
        attributes.itemsPadding && (vars['--wap-features-items-padding'] = attributes.itemsPadding);
        attributes.itemsMargin && (vars['--wap-features-items-margin'] = attributes.itemsMargin);
        attributes.itemsBorder && (vars['--wap-features-items-border'] = attributes.itemsBorder);
        attributes.itemsBorderRadius && (vars['--wap-features-items-border-radius'] = attributes.itemsBorderRadius);
        attributes.itemsSpaceBetweenIconAndLabel && (vars['--wap-features-items-space-between-icon-and-label'] = `${attributes.itemsSpaceBetweenIconAndLabel}px`);
        attributes.itemsFontSize && (vars['--wap-features-items-font-size'] = `${attributes.itemsFontSize}px`);
        attributes.itemsFontWeight && (vars['--wap-features-items-font-weight'] = attributes.itemsFontWeight);
        attributes.itemsTextColor && (vars['--wap-features-items-text-color'] = attributes.itemsTextColor);
        attributes.itemsIconSize && (vars['--wap-features-items-icon-size'] = `${attributes.itemsIconSize}px`);
        attributes.itemsIconColor && (vars['--wap-features-items-icon-color'] = attributes.itemsIconColor);
        
        return vars;
    }, [attributes]);

    // Calculate column span based on items per row
    const itemsPerRow = parseInt(attributes?.itemsPerRow) || 3;
    const colSpan = 24 / itemsPerRow;

    return (
        <Card className="wap-widget-features" style={cssVariables}>
            {!attributes?.hideOversizedWidget && (
                <Row align="middle" className="wap-widget-features__row">
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
                        <Switch checked style={{ background: '#1a4cd8' }} />
                    </Col>
                </Row>
            )}
            <Row gutter={[16, 16]} className="wap-widget-features__grid">
                {features.map((feature, idx) => (
                    <Col xs={24} sm={12} md={colSpan} lg={colSpan} xl={colSpan} key={feature.label}>
                        <div className="wap-widget-features__feature-btn">
                            {!attributes?.hideItemIcons && (
                                <span className="wap-widget-features__feature-icon">{feature.icon}</span>
                            )}
                            {!attributes?.hideItemLabels && feature.label}
                        </div>
                    </Col>
                ))}
            </Row>
        </Card>
    );
};

export default WidgetFeatures; 