import { useMemo } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';
import ControlWrapper from '../components/control-wrapper';
import { __ } from '@wordpress/i18n';


const ProfilesSettings = () => {
    const { WapSwitch } = window?.wapComponents;
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

    const selectedProfiles = Array.isArray(attributes?.profiles) ? attributes.profiles : [];

    const isProfileSelected = (profileId) => selectedProfiles.some((id) => String(id) === String(profileId));

    const toggleProfile = (profileId) => {
        const isSelected = isProfileSelected(profileId);
        const nextProfiles = isSelected
            ? selectedProfiles.filter((id) => String(id) !== String(profileId))
            : [...selectedProfiles, profileId];

        updateAttr({ profiles: nextProfiles });
    };

    return (
        <>
            <ControlWrapper
                label={__('Profiles', 'website-accessibility')}
            >
                <div
                    // style={{ maxHeight: 220, overflow: 'auto' }}
                    onWheel={(e) => e.stopPropagation()} // prevent parent/page scroll
                >
                    <div className="wap-profiles-settings__grid">
                        {profiles.map((profile) => {
                            const checked = isProfileSelected(profile.id);

                            return (
                                <div
                                    key={profile.id}
                                    className={`wap-feature-toggle-card wap-profiles-settings__card${checked ? " wap-feature-toggle-card--active" : ""}`}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => toggleProfile(profile.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            toggleProfile(profile.id);
                                        }
                                    }}
                                    aria-pressed={checked}
                                >
                                    <div className="wap-feature-toggle-card__left">
                                        <div className="wap-feature-toggle-card__icon-wrap" aria-hidden="true">
                                            {profile.icon}
                                        </div>
                                        <div className="wap-feature-toggle-card__label">{profile.name}</div>
                                    </div>
                                    <div className="wap-feature-toggle-card__right">
                                        <WapSwitch
                                            checked={checked}
                                            onChange={() => toggleProfile(profile.id)}
                                            size="small"
                                            onClick={(e) => e.stopPropagation()}
                                            onMouseDown={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </ControlWrapper>

        </>
    );
};

export default ProfilesSettings;
