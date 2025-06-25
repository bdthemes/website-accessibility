import { Collapse, Row, Col } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { STORE_NAME } from '../store';

const AccessibilityProfiles = ({ value }) => {
    const { items } = value;
    const profileItem = items.find(item => item.slug === 'profiles');
    const attributes = profileItem?.attributes || {};
    const profiles = attributes.profiles || [];
    const layout = attributes.layout || 'collapse';
    const collapseTitle = attributes.collapseTitle || 'Accessibility Profiles';
    
    const allProfiles = useSelect((select) => {
        const { getProfiles } = select(STORE_NAME);
        const profiles = getProfiles(true);
        return profiles || [];
    }, []);

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
                        <span className="wap-accessibility-profiles__item-icon">
                            {profile.icon}
                        </span>
                        <span className="wap-accessibility-profiles__item-label">
                            {profile.name}
                        </span>
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
                    <span className="wap-accessibility-profiles__header-icon">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="10" r="8" stroke="#1a4cd8" strokeWidth="2" />
                            <circle cx="10" cy="10" r="3" fill="#1a4cd8" />
                        </svg>
                    </span>
                    <span className="wap-accessibility-profiles__header-label">
                        {collapseTitle}
                    </span>
                    <InfoCircleOutlined className="wap-accessibility-profiles__info-icon" />
                </div>
            ),
            children: profilesGrid,
            className: 'wap-accessibility-profiles__panel'
        }
    ], [selectedProfiles, collapseTitle]);
    
    return (
        <div className="wap-accessibility-profiles">
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
                    <div className="wap-accessibility-profiles__header" style={{ padding: '8px' }}>
                        <span className="wap-accessibility-profiles__header-icon">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <circle cx="10" cy="10" r="8" stroke="#1a4cd8" strokeWidth="2" />
                                <circle cx="10" cy="10" r="3" fill="#1a4cd8" />
                            </svg>
                        </span>
                        <span className="wap-accessibility-profiles__header-label">
                            {collapseTitle}
                        </span>
                        <InfoCircleOutlined className="wap-accessibility-profiles__info-icon" />
                    </div>
                    {profilesGrid}
                </div>
            )}
        </div>
    );
};

export default AccessibilityProfiles; 