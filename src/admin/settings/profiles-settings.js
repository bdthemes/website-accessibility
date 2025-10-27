import { useMemo } from '@wordpress/element';
import { Select, Avatar, Space, Radio, Input } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useSelect, useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';
import ControlWrapper from '../components/control-wrapper';
import { __ } from '@wordpress/i18n';
import WapInput from '../../components/wap-input';

const ProfilesSettings = () => {
    const profilesRaw = useSelect((select) => {
        const { getProfiles } = select(STORE_NAME);
        return getProfiles(true);
    }, []);
    const profiles = useMemo(() => (
        profilesRaw && profilesRaw.length > 0
            ? profilesRaw.map(profile => {
                const { raw } = profile?.content || {};
                const content = raw ? JSON.parse(raw) : {};

                // Handle different icon formats
                let iconElement = null;
                if (profile?.icon) {
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
                    id: profile?.id,
                    name: profile?.title?.rendered,
                    icon: iconElement
                }
            })
            : []
    ), [profilesRaw]);

    const { presetsFormData } = useSelect((select) => select(STORE_NAME).getPresetsFormData());
    const { setPresetsFormData } = useDispatch(STORE_NAME);
    const profileItem = presetsFormData.panel.items.find(item => item.slug === 'profiles');
    const attributes = profileItem?.attributes || {};

    const updateAttr = (updates) => {
        const updatedItems = presetsFormData.panel.items.map((item) =>
            item.slug === 'profiles'
                ? { ...item, attributes: { ...attributes, ...updates } }
                : item
        );

        setPresetsFormData({
            ...presetsFormData,
            panel: {
                ...presetsFormData.panel,
                items: updatedItems
            }
        });
    };

    const profileOptions = profiles.map(profile => ({
        label: (
            <Space>
                <Avatar icon={profile.icon || <UserOutlined />} size="small" />
                {profile.name}
            </Space>
        ),
        value: profile.id,
    }));

    return (
        <>
            <ControlWrapper
                label={__('Profiles', 'website-accessibility')}
            >
                <div
                    style={{ maxHeight: 200, overflow: 'auto' }}
                    onWheel={(e) => e.stopPropagation()} // prevent parent/page scroll
                >
                    <Select
                        mode="multiple"
                        allowClear
                        showSearch
                        placeholder="Select profiles"
                        options={profileOptions}
                        value={attributes.profiles}
                        onChange={(value) => updateAttr({ profiles: value })}
                        style={{ width: '100%' }}
                        optionFilterProp="label"
                    />
                </div>
            </ControlWrapper>

            <ControlWrapper
                label={__('Layout', 'website-accessibility')}
            >
                <Radio.Group
                    value={attributes.layout || 'collapse'}
                    onChange={(e) => updateAttr({ layout: e.target.value })}
                >
                    <Radio value="collapse">{__('With Collapse', 'website-accessibility')}</Radio>
                    <Radio value="simple">{__('Simple List', 'website-accessibility')}</Radio>
                </Radio.Group>
            </ControlWrapper>

            <ControlWrapper
                label={__('Title', 'website-accessibility')}
            >
                <WapInput
                    placeholder={__('Accessibility Profiles', 'website-accessibility')}
                    value={attributes?.collapseTitle || ''}
                    onChange={(e) => updateAttr({ collapseTitle: e.target.value })}
                    style={{ width: '100%' }}
                />
            </ControlWrapper>
        </>
    );
};

export default ProfilesSettings;