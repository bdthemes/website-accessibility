import { useState, useMemo, useEffect } from "@wordpress/element";
import clsx from "clsx";
import useFrontendAccessibility from "./context/useAccessibility";
import accessibilityManager from "../accessibilty-manager";
import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";

const View = () => {
    const { screenReader = () => null, defaultProfiles = [], useBrowserKey, getCookie, setCookie } = window.wapHelpers || {};
    const { PreviewButton, PreviewContent, Icon, WapDrawer, GoogleTranslateConsent = () => null } = window?.wapComponents;
    const { profiles, currentPreset, currentPresetId, settings, nonce, restUrl, isUserLoggedIn } = window?.websiteAccessibility;
    const { dispatch, ...state } = useFrontendAccessibility();
    const [isOpen, setIsOpen] = useState(false);
    const browserKey = useBrowserKey();


    const allProfiles = useMemo(() => [
        ...defaultProfiles,
        ...(profiles || []),
    ], [profiles]);

    const isPreferenceActive = useMemo(() => {
        const footerAttribiutes = currentPreset?.panel?.items?.find((item) => item.slug === 'footer')?.attributes;

        return footerAttribiutes?.activePreference || false;
    }, [currentPreset]);

    function validProfile(currentProfile) {
        if (!currentProfile?.id) return null;

        const isExist = allProfiles.find((profile) => (profile.id === currentProfile?.id || profile.ID === currentProfile?.id));

        return isExist ? currentProfile : null;
    }

    /**
     * Apply preference data to accessibility context
     */
    function applyPreferenceData(preferenceData) {
        if (!preferenceData) return;
        const validCurrentProfile = validProfile(preferenceData.profile);

        if (validCurrentProfile?.id !== preferenceData?.profile?.id) {
            dispatch({ type: 'SET_CURRENT_SETTINGS', payload: {} });
        } else {
            dispatch({ type: 'SET_CURRENT_SETTINGS', payload: preferenceData.settings || {} });
        }
        dispatch({ type: 'SET_CURRENT_PROFILE', payload: validCurrentProfile });
        dispatch({ type: 'SET_OVERSIZED', payload: preferenceData.oversized || false });
        dispatch({ type: 'SET_ENABLE_TRANSLATIONS', payload: preferenceData.enableTranslations || false });
        dispatch({ type: 'SET_SELECTED_LANGUAGE', payload: preferenceData.selectedLanguage || null });
    }

    const saveablePreference = useMemo(() => {
        if (!currentPresetId) return null;
        const { currentProfile, currentSettings, isOverSized, enableTranslations, selectedLanguage } = state;

        const serializableProfile = {
            id: currentProfile?.id,
            name: currentProfile?.name,
            icon: currentProfile?.icon?.props?.dangerouslySetInnerHTML
                ? { __html: currentProfile.icon.props.dangerouslySetInnerHTML.__html }
                : currentProfile?.icon,
        };

        let data = {};
        if (serializableProfile?.id) data.profile = serializableProfile;

        if (Object.keys(currentSettings).length > 0) {
            let settings = {};
            Object.keys(currentSettings).forEach((key) => {
                if (currentSettings[key]?.currentStep !== 0) settings[key] = currentSettings[key];
            });
            if (Object.keys(settings).length > 0) data.settings = settings;
        }

        if (isOverSized) data.oversized = isOverSized;
        if (enableTranslations) {
            data.enableTranslations = enableTranslations;
            data.selectedLanguage = selectedLanguage;
        }

        return { post_id: currentPresetId, data };
    }, [state?.currentProfile, state?.currentSettings, state?.isOverSized, state?.enableTranslations, state?.selectedLanguage]);

    useEffect(() => {
        if (!currentPresetId || !isUserLoggedIn) return;

        const localKey = `${state?.localStorageKeyPrefix}-${currentPresetId}`;
        const localData = localStorage.getItem(localKey);

        // ✅ Use API only if activePreference is true
        if (isPreferenceActive) {
            apiFetch({ path: `/sigmally/v1/preference?post_id=${currentPresetId}`, method: 'GET' })
                .then((response) => {
                    if (response?.success && response.data && Object.keys(response.data).length > 0) {
                        applyPreferenceData(response.data);

                        // Optional: sync localStorage for offline support
                        localStorage.setItem(localKey, JSON.stringify(response.data));
                    } else if (localData) {
                        applyPreferenceData(JSON.parse(localData));
                    }
                })
                .catch((error) => {
                    console.error('Error fetching preference:', error);
                    if (localData) {
                        applyPreferenceData(JSON.parse(localData));
                    }
                });
        } else {
            // 🧩 Local mode (no API call)
            if (localData) {
                applyPreferenceData(JSON.parse(localData));
            }
        }
    }, [currentPresetId, isPreferenceActive]);

    /**
     * Sync preferences to localStorage on change
     */
    useEffect(() => {
        if (!currentPresetId || !saveablePreference?.data) return;
        localStorage.setItem(`${state.localStorageKeyPrefix}-${currentPresetId}`, JSON.stringify(saveablePreference?.data));
    }, [saveablePreference?.data, currentPresetId]);

    const addBodyClasses = (classNames = []) => {
        classNames.forEach(className => {
            if (!document.body.classList.contains(className)) {
                document.body.classList.add(className);
            }
        });
    };

    const removeBodyClasses = (classNames = []) => {
        classNames.forEach(className => {
            if (document.body.classList.contains(className)) {
                document.body.classList.remove(className);
            }
        });
    };

    const findPrefixesClasses = (prefix) => {
        const classes = Array.from(document.body.classList);
        return classes.filter(className => className.startsWith(prefix));
    };

    /**
     * Initialize accessibility manager with current settings
     */
    useEffect(() => {
        accessibilityManager().init(state?.currentSettings);

        if (findPrefixesClasses(`one-accessibility-feature`).length > 0) {
            removeBodyClasses(findPrefixesClasses(`one-accessibility-feature`));
        }
        
        for (const key in state?.currentSettings) {
            const value = state?.currentSettings[key];
            if(!value?.currentStep || value?.currentStep === 0) continue;

            const attr = value?.currentAttribute;
            if (!attr?.value) continue;
            
            addBodyClasses([`one-accessibility-feature-${key}-${attr?.value}`]);
        }

        if (state?.enableTranslations && state?.selectedLanguage) {
            addBodyClasses(['one-accessibility-feature-enable-translations', `one-accessibility-feature-language-${state?.selectedLanguage}`]);
        }

        if (state?.currentProfile?.id) {
            addBodyClasses([`one-accessibility-feature-profile-${state?.currentProfile?.id}`]);
        }
        
    }, [state?.currentSettings, currentPresetId, state?.currentProfile, state?.isOverSized, state?.enableTranslations, state?.selectedLanguage]);

    /**
     * Keyboard shortcuts: ESC to close, Ctrl+U to open
     */
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }

            if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
                e.preventDefault();
                setIsOpen(true);
            }
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen]);

    /**
     * Screen reader announcements for drawer open/close
     */
    useEffect(() => {
        const currentSettings = state?.currentSettings;
        if (!currentSettings?.screenReader?.currentStep) return;

        if (isOpen) {
            screenReader()?.speak(__('Accessibility Menu Open', 'website-accessibility'));
        } else {
            screenReader()?.speak(__('Accessibility Menu Close', 'website-accessibility'));
        }
    }, [isOpen]);

    const saveStatistics = async (data = {}) => {
        let dailyTimestamp = getCookie('one_accessibility_daily_timestamp');

        // Check if browserKey exists
        if (!browserKey) return;

        if (!nonce) {
            console.warn('Nonce missing. Statistics not sent.');
            return;
        }

        if (!restUrl) return;

        const now = Date.now();
        const twelveHours = 12 * 60 * 60 * 1000;
        const statistics = {};

        for (const key in data) {
            if (data?.[key]?.currentStep == 0) {
                continue;
            }

            statistics[key] = 1
        }

        // Throttle by daily timestamp (12h)
        if (dailyTimestamp && now - dailyTimestamp < twelveHours) {
            return;
        }
        const apiURL = `${restUrl}one-accessibility/v1/usage-statistics`;

        try {
            const response = await fetch(apiURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': nonce,
                },
                body: JSON.stringify({ ...statistics, browserKey }),
            });

            const result = await response.json();

            if (result.success) {
                setCookie('one_accessibility_daily_timestamp', now, 0.5); // 12 hours
            } else {
                console.warn('Failed to save statistics', result.message);
            }
        } catch (err) {
            console.error('Error sending statistics', err);
        }
    };

    /**
     * Body class toggle for drawer open state
     */
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('wap-accessibility-sidebar-open');
        } else {
            document.body.classList.remove('wap-accessibility-sidebar-open');
        }

        return () => {
            document.body.classList.remove('wap-accessibility-sidebar-open');
        };
    }, [isOpen]);

    if (!currentPreset) return null;

    return (
        <div className="wap-accessibility-view">

            <PreviewButton
                type="default"
                text={currentPreset?.button?.buttonType !== 'icon' ? currentPreset?.button?.text : null}
                icon={currentPreset?.button?.buttonType !== 'text' ? <Icon name={currentPreset?.button?.icon} /> : null}
                className={clsx(
                    'wap-button-style-preset__preview-btn',
                    currentPreset?.button?.position,
                    currentPreset?.button?.buttonType && `wap-button-style-preset__preview-btn--${currentPreset?.button?.buttonType}`
                )}
                style={{
                    '--button-font-size': currentPreset?.button?.fontSize,
                    '--button-icon-size': currentPreset?.button?.iconSize,
                    '--button-color': currentPreset?.button?.color,
                    '--button-bg': currentPreset?.button?.bgColor,
                    '--button-padding': currentPreset?.button?.padding,
                    '--button-radius': currentPreset?.button?.borderRadius,
                    '--button-offset-x': currentPreset?.button?.offsetX ? `${currentPreset?.button?.offsetX}px` : '0',
                    '--button-offset-y': currentPreset?.button?.offsetY ? `${currentPreset?.button?.offsetY}px` : '0',
                }}
                onClick={() => setIsOpen(true)}
                onFocus={(e) => e.preventDefault()}
                aria-label={__('Accessibility Menu', 'website-accessibility')}
            />
            <WapDrawer
                open={isOpen}
                onClose={() => {
                    setIsOpen(false)
                    if (settings?.show_usage_statistics && saveablePreference?.data?.settings) {
                        saveStatistics(saveablePreference?.data?.settings);
                    }
                }}
                placement={currentPreset?.panel?.wrapper?.position || "right"}
                className={`wap-preset__preview-drawer wap-preset__preview-drawer--${currentPreset?.panel?.wrapper?.position || 'right'}`}
                rootClassName={`wap-preset__preview-drawer-root wap-preset__preview-drawer-root--${currentPreset?.panel?.wrapper?.position || 'right'}`}
                width={Number(currentPreset?.panel?.wrapper?.width) || 400}
            >
                <PreviewContent
                    panel={currentPreset?.panel}
                    allProfiles={allProfiles}
                    setIsOpen={setIsOpen}
                    isOpen={isOpen}
                    accessibilityContext={state}
                    accessibilityDispatch={dispatch}
                />
            </WapDrawer>
            <GoogleTranslateConsent showModal={settings?.show_translations_consent} translateSiteLang={settings?.force_translate_site_language} accessibilityContext={state} />
        </div>
    );
};

export default View;
