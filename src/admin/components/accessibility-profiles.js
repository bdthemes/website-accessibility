import { Collapse, Row, Col } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { STORE_NAME } from '../store';

const AccessibilityProfiles = ({ value, allProfiles }) => {
    const { items } = value;
    const profileItem = items.find(item => item.slug === 'profiles');
    const attributes = profileItem?.attributes || {};
    const profiles = attributes.profiles || [];
    const layout = attributes.layout || 'collapse';
    const collapseTitle = attributes.collapseTitle || 'Accessibility Profiles';

    // Get CSS variables from settings
    const cssVariables = useMemo(() => {
        const vars = {};
        
        // General styling
        attributes.backgroundColor && (vars['--wap-profiles-background-color'] = attributes.backgroundColor);
        attributes.padding && (vars['--wap-profiles-padding'] = attributes.padding);
        attributes.margin && (vars['--wap-profiles-margin'] = attributes.margin);
        attributes.border && (vars['--wap-profiles-border'] = attributes.border);
        attributes.borderRadius && (vars['--wap-profiles-border-radius'] = attributes.borderRadius);
        
        // Header styling
        attributes.headerPadding && (vars['--wap-profiles-header-padding'] = attributes.headerPadding);
        attributes.headerMargin && (vars['--wap-profiles-header-margin'] = attributes.headerMargin);
        attributes.headerBorder && (vars['--wap-profiles-header-border'] = attributes.headerBorder);
        attributes.headerBorderRadius && (vars['--wap-profiles-header-border-radius'] = attributes.headerBorderRadius);
        attributes.headerSpaceBetweenAvatarAndName && (vars['--wap-profiles-header-space-between-avatar-and-name'] = `${attributes.headerSpaceBetweenAvatarAndName}px`);
        attributes.headerTitleFontSize && (vars['--wap-profiles-header-title-font-size'] = `${attributes.headerTitleFontSize}px`);
        attributes.headerTitleFontWeight && (vars['--wap-profiles-header-title-font-weight'] = attributes.headerTitleFontWeight);
        attributes.headerTitleTextColor && (vars['--wap-profiles-header-title-text-color'] = attributes.headerTitleTextColor);
        attributes.headerAvatarSize && (vars['--wap-profiles-header-avatar-size'] = `${attributes.headerAvatarSize}px`);
        attributes.headerAvatarBorder && (vars['--wap-profiles-header-avatar-border'] = attributes.headerAvatarBorder);
        attributes.headerAvatarBorderRadius && (vars['--wap-profiles-header-avatar-border-radius'] = attributes.headerAvatarBorderRadius);
        
        // Body styling
        attributes.bodyPadding && (vars['--wap-profiles-body-padding'] = attributes.bodyPadding);
        attributes.bodyMargin && (vars['--wap-profiles-body-margin'] = attributes.bodyMargin);
        attributes.bodyBorder && (vars['--wap-profiles-body-border'] = attributes.bodyBorder);
        attributes.bodyBorderRadius && (vars['--wap-profiles-body-border-radius'] = attributes.bodyBorderRadius);
        attributes.bodySpaceBetweenAvatarAndName && (vars['--wap-profiles-body-space-between-avatar-and-name'] = `${attributes.bodySpaceBetweenAvatarAndName}px`);
        attributes.bodyFontSize && (vars['--wap-profiles-body-font-size'] = `${attributes.bodyFontSize}px`);
        attributes.bodyFontWeight && (vars['--wap-profiles-body-font-weight'] = attributes.bodyFontWeight);
        attributes.bodyTextColor && (vars['--wap-profiles-body-text-color'] = attributes.bodyTextColor);
        attributes.bodyAvatarSize && (vars['--wap-profiles-body-avatar-size'] = `${attributes.bodyAvatarSize}px`);
        attributes.bodyAvatarBorder && (vars['--wap-profiles-body-avatar-border'] = attributes.bodyAvatarBorder);
        attributes.bodyAvatarBorderRadius && (vars['--wap-profiles-body-avatar-border-radius'] = attributes.bodyAvatarBorderRadius);
        
        return vars;
    }, [attributes]);

    const processedProfiles = useMemo(() => {
        if (!allProfiles || allProfiles.length === 0) {
            return [];
        }
        
        return allProfiles.map(profile => {
            let content = profile?.content?.raw || '';
            if (content) {
                try {
                    content = JSON.parse(content);
                } catch (e) {
                    content = {};
                }
            }

            // Handle different icon formats
            let iconElement = null;
            if (profile.icon) {
                iconElement = profile.icon;
            } else if (content?.icon) {
                // If content.icon is a string, render it as HTML
                if (typeof content.icon === 'string' && content.icon.trim()) {
                    iconElement = (
                        <span 
                            dangerouslySetInnerHTML={{ __html: content.icon }} 
                            style={{ 
                                display: 'inline-flex',
                                width: '20px',
                                height: '20px'
                            }}
                        />
                    );
                }
            }

            return {
                id: profile.id,
                name: profile.title.rendered,
                icon: iconElement
            };
        });
    }, [allProfiles]);

    const selectedProfiles = useMemo(() => {
        return processedProfiles.filter(profile => profiles.includes(profile.id));
    }, [processedProfiles, profiles]);
    
    const profilesGrid = (
        <Row gutter={[16, 16]} className="wap-accessibility-profiles__grid">
            {selectedProfiles.map(profile => (
                <Col span={12} key={profile.id}>
                    <div className="wap-accessibility-profiles__item">
                        {!attributes.hideBodyAvatar && (
                            <span className="wap-accessibility-profiles__item-icon">
                                {profile.icon}
                            </span>
                        )}
                        {!attributes.hideBodyProfileName && (
                            <span className="wap-accessibility-profiles__item-label">
                                {profile.name}
                            </span>
                        )}
                    </div>
                </Col>
            ))}
        </Row>
    );

    const collapseItems = useMemo(() => [
        {
            key: '1',
            label: (
                <div className="wap-accessibility-profiles__header">
                    {!attributes.hideHeaderAvatar && (
                        <span className="wap-accessibility-profiles__header-icon">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <circle cx="10" cy="10" r="8" stroke="#1a4cd8" strokeWidth="2" />
                                <circle cx="10" cy="10" r="3" fill="#1a4cd8" />
                            </svg>
                        </span>
                    )}
                    {!attributes.hideHeaderProfileName && (
                        <span className="wap-accessibility-profiles__header-label">
                            {collapseTitle}
                        </span>
                    )}
                    <InfoCircleOutlined className="wap-accessibility-profiles__info-icon" />
                </div>
            ),
            children: profilesGrid,
            className: 'wap-accessibility-profiles__panel'
        }
    ], [selectedProfiles, collapseTitle, attributes.hideHeaderAvatar, attributes.hideHeaderProfileName]);
    
    return (
        <div className="wap-accessibility-profiles" style={cssVariables}>
            {layout === 'collapse' ? (
                <Collapse
                    defaultActiveKey={[]}
                    bordered={false}
                    expandIconPosition="end"
                    className="wap-accessibility-profiles__collapse"
                    items={collapseItems}
                />
            ) : (
                <div className="wap-accessibility-profiles__simple">
                    <div className="wap-accessibility-profiles__header">
                        {!attributes.hideHeaderAvatar && (
                            <span className="wap-accessibility-profiles__header-icon">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <circle cx="10" cy="10" r="8" stroke="#1a4cd8" strokeWidth="2" />
                                    <circle cx="10" cy="10" r="3" fill="#1a4cd8" />
                                </svg>
                            </span>
                        )}
                        {!attributes.hideHeaderProfileName && (
                            <span className="wap-accessibility-profiles__header-label">
                                {collapseTitle}
                            </span>
                        )}
                        <InfoCircleOutlined className="wap-accessibility-profiles__info-icon" />
                    </div>
                    {profilesGrid}
                </div>
            )}
        </div>
    );
};

export default AccessibilityProfiles; 