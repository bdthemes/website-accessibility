import { Collapse, Row, Col } from 'antd';
import { InfoCircleOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useMemo } from '@wordpress/element';
import clsx from 'clsx';
import { features, isScreenReaderActive } from '../utils';
import screenReader from '../screen-reader';


/* -------------------- 🔹 ProfileItem Component -------------------- */
const ProfileItem = ({ profile, isActive, handleClick, attributes }) => {
    return (
        <div
            className={clsx(
                "wap-accessibility-profiles__item",
                { "wap-accessibility-profiles__item--active": isActive }
            )}
            onClick={() => handleClick(profile)}
            style={{ cursor: 'pointer', position: 'relative' }}
        >
            {!attributes?.hideBodyAvatar && (
                <span className="wap-accessibility-profiles__item-icon">
                    {profile.icon}
                </span>
            )}
            {!attributes?.hideBodyProfileName && (
                <span className="wap-accessibility-profiles__item-label">
                    {profile.name}
                </span>
            )}
            {isActive && (
                <div className="wap-accessibility-profiles__item-active-indicator">
                    <CheckCircleFilled
                        style={{
                            color: '#52c41a',
                            fontSize: '16px',
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            zIndex: 1,
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            padding: '1px'
                        }}
                    />
                </div>
            )}
        </div>
    );
};

/* -------------------- 🔹 ProfilesGrid Component -------------------- */
const ProfilesGrid = ({ profiles, currentProfile, handleClick, attributes }) => {
    return (
        <Row gutter={[16, 16]} className="wap-accessibility-profiles__grid">
            {profiles.map(profile => {
                const isActive = String(currentProfile?.id) === String(profile.id);
                return (
                    <Col span={12} key={profile.id}>
                        <ProfileItem
                            profile={profile}
                            isActive={isActive}
                            handleClick={handleClick}
                            attributes={attributes}
                        />
                    </Col>
                );
            })}
        </Row>
    );
};

/* -------------------- 🔹 AccessibilityProfiles (Main) -------------------- */
const AccessibilityProfiles = ({
    value,
    allProfiles,
    accessibilityContext,
    accessibilityDispatch
}) => {
    const { items } = value;
    const profileItem = items.find(item => item.slug === 'profiles');
    const attributes = profileItem?.attributes || {};
    const profiles = attributes.profiles || [];
    const layout = attributes.layout || 'collapse';
    const collapseTitle = attributes.collapseTitle || 'Accessibility Profiles';

    const isFrontend = !!accessibilityContext && !!accessibilityDispatch;
    const { currentProfile, currentSettings } = accessibilityContext || {};
    const reader = isScreenReaderActive(currentSettings) ? screenReader() : null;

    const processedProfiles = useMemo(() => {
        if (!allProfiles || allProfiles.length === 0) return [];

        return allProfiles.map(profile => {
            let content = profile?.content?.raw || profile?.post_content || '';
            if (content) {
                try {
                    content = JSON.parse(content);
                } catch (e) {
                    content = {};
                }
            }

            let iconElement = null;
            if (profile.icon) {
                iconElement = profile.icon;
            } else if (content?.icon && typeof content.icon === 'string' && content.icon.trim()) {
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

            return {
                id: profile?.id || profile?.ID,
                name: profile?.title?.rendered || profile?.title || profile?.post_title,
                icon: iconElement,
                settings: content?.features || profile?.features || {}
            };
        });
    }, [allProfiles]);

    const selectedProfiles = useMemo(() => {
        return processedProfiles.filter(profile => profiles.includes(profile.id));
    }, [processedProfiles, profiles]);

    const handleProfileClick = (profile) => {
        if (!isFrontend) return;

        const profileSettings = profile.settings || {};
        let updatedSettings = {};
        for (const key in profileSettings) {
            const setting = profileSettings[key];
            const feature = features.find(f => f.key === key);
            if (feature) {
                const currentIndex = feature.attributes.findIndex(attr => attr.value == setting);
                const isMultiStep = feature.attributes.length !== 2 && feature.attributes[0]?.value !== 'enable';
                const currentAttribute = isMultiStep ? feature.attributes[currentIndex] : feature.attributes[0];
                updatedSettings[key] = {
                    currentStep: isMultiStep ? currentIndex + 1 : 1,
                    currentAttribute,
                    isMultiStep
                };
            }
        }

        accessibilityDispatch({
            type: 'RESET_ACCESSIBILITY',
        });

        accessibilityDispatch({
            type: 'SET_CURRENT_PROFILE',
            payload: currentProfile?.id === profile.id ? null : profile,
        });

        if (currentProfile?.id !== profile.id) {
            reader?.speak(`Switched to ${profile.name} accessibility profile.`);
            accessibilityDispatch({
                type: 'SET_CURRENT_SETTINGS',
                payload: updatedSettings,
            });
        } else {
            reader?.speak(`Accessibility profile reset.`);
            accessibilityDispatch({
                type: 'RESET_ACCESSIBILITY',
            });
        }
    };
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
            children: (
                <ProfilesGrid
                    profiles={selectedProfiles}
                    currentProfile={currentProfile}
                    handleClick={handleProfileClick}
                    attributes={attributes}
                />
            ),
            className: 'wap-accessibility-profiles__panel'
        }
    ], [selectedProfiles, currentProfile, attributes]);

    return (
        <div className={clsx('wap-accessibility-profiles', {
            [`wap-accessibility-profiles--${layout}`]: layout
        })}>
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
                    <ProfilesGrid
                        profiles={selectedProfiles}
                        currentProfile={currentProfile}
                        handleClick={handleProfileClick}
                        attributes={attributes}
                    />
                </div>
            )}
        </div>
    );
};

export default AccessibilityProfiles;
