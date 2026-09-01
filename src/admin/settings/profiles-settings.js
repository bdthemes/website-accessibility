import { useEffect, useMemo } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';
import ControlWrapper from '../components/control-wrapper';
import PanelItemsSettings from '../components/panel-items-settings';
import { useLocation } from '../router';
import { __ } from '@wordpress/i18n';


const ProfilesSettings = () => {
    const { WapSwitch, WapMessage } = window?.wapComponents;
    const location = useLocation();
    const presetId =
        location?.params?.page === 'website-accessibility-presets-edit'
            ? location?.params?.id
            : null;
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
    const { setPresetsFormData, updatePreset, saveEditedPreset } = useDispatch(STORE_NAME);
    const profileItem = presetsFormData.panel.items.find(item => item.slug === 'profiles');
    const attributes = profileItem?.attributes || {};

    const buildNextFormData = (nextProfiles) => {
        const updatedItems = presetsFormData.panel.items.map((item) =>
            item.slug === 'profiles'
                ? { ...item, attributes: { ...attributes, profiles: nextProfiles } }
                : item
        );

        return {
            ...presetsFormData,
            panel: {
                ...presetsFormData.panel,
                items: updatedItems
            }
        };
    };

    const selectedProfiles = Array.isArray(attributes?.profiles) ? attributes.profiles : [];

    const isProfileSelected = (profileId) => selectedProfiles.some((id) => String(id) === String(profileId));

    const toggleProfile = async (profileId) => {
        // Store custom-profile ids as numbers, the way the profile cards supply
        // them. Add-ons calling in through the enable event may pass a string,
        // and a mixed list makes strict lookups elsewhere miss. Built-in
        // profiles keep their slug ("motor", "low-vision", …).
        const normalizedId = /^\d+$/.test(String(profileId)) ? Number(profileId) : profileId;
        const isSelected = isProfileSelected(normalizedId);
        const nextProfiles = isSelected
            ? selectedProfiles.filter((id) => String(id) !== String(normalizedId))
            : [...selectedProfiles, normalizedId];

        const nextFormData = buildNextFormData(nextProfiles);
        setPresetsFormData(nextFormData);

        // Let add-ons (e.g. guided tours) react; they may persist the preset right away.
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('websac-preset-profile-toggled', {
                detail: {
                    profileId: normalizedId,
                    enabled: !isSelected,
                    presetId,
                    save: async () => {
                        if (!presetId) return false;
                        await updatePreset(presetId, {
                            title: nextFormData.title,
                            content: JSON.stringify(nextFormData),
                        });
                        // saveEditedPreset resolves { success, error }. core-data
                        // returns undefined instead of throwing when the REST call
                        // fails, so an unchecked await reports a failed save as a
                        // successful one — the tour would then finish over a preset
                        // that never persisted, with nothing shown to the user.
                        const result = await saveEditedPreset(presetId);
                        if (!result || result.success !== true) {
                            WapMessage?.error(
                                result?.error?.message ||
                                __('Could not save the preset. Check your connection and try again.', 'website-accessibility')
                            );
                            return false;
                        }
                        return true;
                    },
                },
            }));
        }
    };

    // Add-ons (the Pro guided tour) can ask for a profile to be switched on —
    // pressing "Done" on the final tour step should do what the step describes
    // instead of just closing. Enable-only by design: it never switches one off,
    // and does nothing when the profile is already on.
    // No dependency array: selectedProfiles and toggleProfile are rebuilt every
    // render, and the listener must close over the current ones.
    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        const onRequestEnable = (event) => {
            const profileId = event?.detail?.profileId;
            if (!profileId || isProfileSelected(profileId)) {
                return;
            }
            toggleProfile(profileId);
        };
        window.addEventListener('websac-request-profile-enable', onRequestEnable);
        return () => window.removeEventListener('websac-request-profile-enable', onRequestEnable);
    });

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
                                    data-profile-id={profile.id}
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

            <PanelItemsSettings
                attributes={attributes}
                updateAttr={(updates) => {
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
                }}
                showTooltip={false}
                defaultLayout="inline"
            />
        </>
    );
};

export default ProfilesSettings;
