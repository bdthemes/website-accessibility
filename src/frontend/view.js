import { useState, useMemo, useEffect, useRef, useCallback } from "@wordpress/element";
import clsx from "clsx";
import useFrontendAccessibility from "./context/useAccessibility";
import accessibilityManager from "../accessibilty-manager";
import { announce } from "../utils/feature-handlers";
import { toCssLength } from "../utils/helpers";
import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";

const View = () => {
    const { defaultProfiles = [], useBrowserKey } = window.wapHelpers || {};
    // FrontendExtensions: optional add-on component rendered next to the toolbar (receives context + dispatch).
    const { PreviewButton, PreviewContent, Icon, WapDrawer, FrontendExtensions = null } = window?.wapComponents;
    const { profiles, currentPreset, currentPresetId, settings, nonce, restUrl, isUserLoggedIn } = window?.websiteAccessibility;
    const { dispatch, ...state } = useFrontendAccessibility();
    const [isOpen, setIsOpen] = useState(false);
    const justClosedRef = useRef(false);
    const closeCooldownTimer = useRef(null);
    const browserKey = useBrowserKey(!!settings?.show_usage_statistics);
    const isSavingStatisticsRef = useRef(false);
    const statisticsDebounceRef = useRef(null);
    // Pending retry for a snapshot the server throttled away (see saveStatistics).
    const statisticsRetryRef = useRef(null);

    const closeAccessibilityDrawer = useCallback(() => {
        justClosedRef.current = true;
        setIsOpen(false);
        if (closeCooldownTimer.current) clearTimeout(closeCooldownTimer.current);
        closeCooldownTimer.current = setTimeout(() => {
            justClosedRef.current = false;
            closeCooldownTimer.current = null;
        }, 600);
    }, []);

    const openAccessibilityDrawer = useCallback(() => {
        if (justClosedRef.current) return;
        setIsOpen(true);
    }, []);

    useEffect(() => () => {
        if (closeCooldownTimer.current) clearTimeout(closeCooldownTimer.current);
    }, []);


    const allProfiles = useMemo(() => [
        ...defaultProfiles,
        ...(profiles || []),
    ], [profiles]);

    const drawerContentWrapperMaxHeightVh = useMemo(() => {
        const raw = currentPreset?.panel?.wrapper?.maxHeight;
        if (raw === undefined || raw === null || raw === '') {
            return 80;
        }
        const n = Number(raw);
        if (!Number.isFinite(n) || n <= 0) {
            return 80;
        }
        if (n > 100) return 80;
        return n;
    }, [currentPreset?.panel?.wrapper?.maxHeight]);

    const isPreferenceActive = useMemo(() => {
        const footerAttribiutes = currentPreset?.panel?.items?.find((item) => item.slug === 'footer')?.attributes;

        return footerAttribiutes?.activePreference || false;
    }, [currentPreset]);

    function validProfile(currentProfile) {
        if (!currentProfile?.id) return null;

        const isExist = allProfiles.find((profile) => (profile.id === currentProfile?.id || profile.ID === currentProfile?.id));

        // Always restore the canonical profile definition (icon, features…), never
        // the serialized copy that was stored with the preference.
        return isExist || null;
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
        const selectedLanguage = preferenceData.selectedLanguage || null;
        dispatch({ type: 'SET_SELECTED_LANGUAGE', payload: selectedLanguage });
    }

    const saveablePreference = useMemo(() => {
        if (!currentPresetId) return null;
        const { currentProfile, currentSettings, isOverSized, selectedLanguage } = state;

        // Only the identifier is persisted; the profile definition is resolved on load.
        const serializableProfile = {
            id: currentProfile?.id,
            name: currentProfile?.name,
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
        if (selectedLanguage) {
            data.selectedLanguage = selectedLanguage;
        }

        return { post_id: currentPresetId, data };
    }, [state?.currentProfile, state?.currentSettings, state?.isOverSized, state?.selectedLanguage, state?.siteLanguage]);

    useEffect(() => {
        if (!currentPresetId) return;

        const localKey = `${state?.localStorageKeyPrefix}-${currentPresetId}`;
        const localData = localStorage.getItem(localKey);

        // ✅ Use API only if activePreference is true and user is logged in
        if (isPreferenceActive && isUserLoggedIn) {
            apiFetch({ path: `/websac/v1/preference?post_id=${currentPresetId}`, method: 'GET' })
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
    }, [currentPresetId, isPreferenceActive, isUserLoggedIn]);

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

    // Body classes this component added last time (only these are removed on the next run, so
    // classes added by add-ons under the same prefix are left alone).
    const ownBodyClassesRef = useRef([]);

    /**
     * Initialize accessibility manager with current settings
     */
    useEffect(() => {
        accessibilityManager().init(state?.currentSettings);

        removeBodyClasses(ownBodyClassesRef.current);

        const nextClasses = [];
        for (const key in state?.currentSettings) {
            const value = state?.currentSettings[key];
            if(!value?.currentStep || value?.currentStep === 0) continue;

            const attr = value?.currentAttribute;
            if (!attr?.value) continue;

            nextClasses.push(`one-accessibility-feature-${key}-${attr?.value}`);
        }

        if (state?.currentProfile?.id) {
            nextClasses.push(`one-accessibility-feature-profile-${state?.currentProfile?.id}`);
        }

        addBodyClasses(nextClasses);
        ownBodyClassesRef.current = nextClasses;

    }, [state?.currentSettings, currentPresetId, state?.currentProfile, state?.isOverSized]);

    /**
     * Keyboard shortcuts: ESC to close, Ctrl+U to open
     */
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape' && isOpen) {
                closeAccessibilityDrawer();
            }

            if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
                e.preventDefault();
                openAccessibilityDrawer();
            }
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, closeAccessibilityDrawer, openAccessibilityDrawer]);

    /**
     * Announce drawer open/close to add-ons (e.g. a text-to-speech feature).
     */
    useEffect(() => {
        announce(
            isOpen ? __('Accessibility Menu Open', 'website-accessibility') : __('Accessibility Menu Close', 'website-accessibility'),
            { event: isOpen ? 'open' : 'close', settings: state?.currentSettings }
        );
    }, [isOpen]);

    const saveStatistics = async (data) => {
        if (isSavingStatisticsRef.current) return;

        // Check if browserKey exists
        if (!browserKey) return;

        if (!nonce) {
            console.warn('Nonce missing. Statistics not sent.');
            return;
        }

        if (!restUrl) return;

        const statistics = {};

        for (const key in data) {
            if (data?.[key]?.currentStep == 0) {
                continue;
            }

            statistics[key] = 1;
        }
        
        const apiURL = `${restUrl}websac/v1/usage-statistics`;

        try {
            isSavingStatisticsRef.current = true;
            const response = await fetch(apiURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': nonce,
                },
                body: JSON.stringify({ ...statistics, browserKey }),
            });

            const result = await response.json();

            if (!result.success) {
                // The endpoint accepts one write per browser every 5 seconds, and
                // the payload is a snapshot rather than an increment — so a
                // rejected write silently leaves the previous state on the
                // dashboard. That is exactly what "switch a widget on, then
                // reset" hits. Re-send the latest snapshot once the window has
                // passed; a newer interaction replaces this pending retry.
                if (statisticsRetryRef.current) {
                    clearTimeout(statisticsRetryRef.current);
                }
                statisticsRetryRef.current = setTimeout(() => {
                    statisticsRetryRef.current = null;
                    saveStatistics(data);
                }, 5500);
            }
        } catch (err) {
            console.error('Error sending statistics', err);
        } finally {
            isSavingStatisticsRef.current = false;
        }
    };

    const handleFeatureInteraction = (nextSettings = {}) => {
        if (!settings?.show_usage_statistics) return;
        if (statisticsDebounceRef.current) {
            clearTimeout(statisticsDebounceRef.current);
        }
        
        // A fresh interaction supersedes any snapshot waiting to be retried.
        if (statisticsRetryRef.current) {
            clearTimeout(statisticsRetryRef.current);
            statisticsRetryRef.current = null;
        }

        statisticsDebounceRef.current = setTimeout(() => {
            saveStatistics(nextSettings || {});
        }, 1000);
    };

    useEffect(() => {
        return () => {
            if (statisticsDebounceRef.current) {
                clearTimeout(statisticsDebounceRef.current);
            }
            if (statisticsRetryRef.current) {
                clearTimeout(statisticsRetryRef.current);
            }
        };
    }, []);

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

    /**
     * Deep link from tour / support: ?websac_open=1 opens the accessibility panel once.
     */
    useEffect(() => {
        if (!currentPreset) {
            return undefined;
        }
        let rafId = 0;
        try {
            const url = new URL(window.location.href);
            const raw = (url.searchParams.get("websac_open") || "").toLowerCase();
            const shouldOpen = raw === "1" || raw === "true" || raw === "yes";
            if (!shouldOpen) {
                return undefined;
            }
            rafId = window.requestAnimationFrame(() => {
                openAccessibilityDrawer();
            });
            url.searchParams.delete("websac_open");
            window.history.replaceState({}, "", url.toString());
        } catch {
            // Invalid URL — ignore
        }
        return () => {
            if (rafId) {
                window.cancelAnimationFrame(rafId);
            }
        };
    }, [currentPreset, openAccessibilityDrawer]);

    if (!currentPreset) return null;

    return (
        <div className="wap-accessibility-view notranslate" translate="no">

            <PreviewButton
                type="default"
                text={currentPreset?.button?.buttonType !== 'icon' ? currentPreset?.button?.text : null}
                icon={currentPreset?.button?.buttonType !== 'text' ? <Icon name={currentPreset?.button?.icon} /> : null}
                className={clsx(
                    'notranslate',
                    'wap-button-style-preset__preview-btn',
                    currentPreset?.button?.position,
                    currentPreset?.button?.buttonType && `wap-button-style-preset__preview-btn--${currentPreset?.button?.buttonType}`,
                    isOpen && 'wap-accessibility-launcher--no-pointer'
                )}
                style={{
                    '--button-font-size': currentPreset?.button?.fontSize,
                    '--button-icon-size': currentPreset?.button?.iconSize,
                    '--button-color': currentPreset?.button?.color,
                    '--button-bg': currentPreset?.button?.bgColor,
                    '--button-padding': currentPreset?.button?.padding,
                    '--button-radius': toCssLength(currentPreset?.button?.borderRadius),
                    '--button-offset-x': currentPreset?.button?.offsetX ? `${currentPreset?.button?.offsetX}px` : '',
                    '--button-offset-y': currentPreset?.button?.offsetY ? `${currentPreset?.button?.offsetY}px` : '',
                }}
                onClick={() => openAccessibilityDrawer()}
                onFocus={(e) => e.preventDefault()}
                aria-label={__('Accessibility Menu', 'website-accessibility')}
            />
            <WapDrawer
                open={isOpen}
                onClose={closeAccessibilityDrawer}
                placement={currentPreset?.panel?.wrapper?.position || "right"}
                className={`wap-preset__preview-drawer notranslate wap-preset__preview-drawer--${currentPreset?.panel?.wrapper?.position || 'right'}`}
                rootClassName={`wap-preset__preview-drawer-root notranslate wap-preset__preview-drawer-root--${currentPreset?.panel?.wrapper?.position || 'right'}`}
                width={Number(currentPreset?.panel?.wrapper?.width) || 400}
                styles={{
                    wrapper: { maxHeight: `${drawerContentWrapperMaxHeightVh}vh` },
                }}
                mask={false}
                keyboard
                maskClosable={false}
                autoFocus={false}
            >
                <PreviewContent
                    panel={currentPreset?.panel}
                    allProfiles={allProfiles}
                    setIsOpen={closeAccessibilityDrawer}
                    isOpen={isOpen}
                    accessibilityContext={state}
                    accessibilityDispatch={dispatch}
                    onFeatureInteraction={handleFeatureInteraction}
                />
            </WapDrawer>
            {FrontendExtensions ? (
                <FrontendExtensions
                    accessibilityContext={state}
                    accessibilityDispatch={dispatch}
                    currentPreset={currentPreset}
                    settings={settings}
                    isOpen={isOpen}
                />
            ) : null}
        </div>
    );
};

export default View;
