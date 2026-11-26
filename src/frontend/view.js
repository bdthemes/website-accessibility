import { useState, useMemo, useEffect, useRef, useCallback } from "@wordpress/element";
import clsx from "clsx";
import useFrontendAccessibility from "./context/useAccessibility";
import { initialState } from "./context/reducer";
import accessibilityManager from "../accessibilty-manager";
import { announce } from "../utils/feature-handlers";
import { toCssLength } from "../utils/helpers";
import { useI18nVersion } from "../utils/i18n-version";
import { __, sprintf } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";

/**
 * The saved preference in this browser, or null. A broken entry (edited by hand,
 * cut short by a full storage) is removed instead of stopping the toolbar on
 * every page from then on. Storage itself may be blocked (private windows).
 *
 * @param {string} key Storage key.
 * @return {Object|null} The saved preference, or null when there is none.
 */
const readLocalPreference = (key) => {
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) {
            return null;
        }
        const data = JSON.parse(raw);
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            return data;
        }
    } catch {
        // Fall through: drop what cannot be read.
    }
    try {
        window.localStorage.removeItem(key);
    } catch {
        // Storage unavailable.
    }
    return null;
};

/**
 * @param {string} key  Storage key.
 * @param {Object} data Preference to keep in this browser.
 */
const writeLocalPreference = (key, data) => {
    try {
        window.localStorage.setItem(key, JSON.stringify(data));
    } catch {
        // Storage full or blocked: the preference simply is not kept.
    }
};

/** A CSS value part that may not come back from storage: rule breakouts, script, loading. */
const UNSAFE_SAVED_CSS = /[{}\\\n\r]|expression\s*\(|@import|javascript:|behavior\s*:|-moz-binding|image-set\s*\(|\bsrc\s*\(/i;

/**
 * Whether a saved CSS value is a plain declaration value: nothing that leaves its
 * rule or loads from another host. url() is allowed for inline images only
 * (data:image/…, e.g. a cursor), whose quoted text may hold ; and <svg> markup.
 *
 * @param {*} value Saved CSS value.
 * @return {boolean} Whether the value may be applied.
 */
const isSafeSavedCssValue = (value) => {
    if (typeof value === 'number') {
        return Number.isFinite(value);
    }
    if (typeof value !== 'string' || value.length > 2048) {
        return false;
    }
    // Take out the inline images first, then nothing else may load or break out.
    const rest = value
        .replace(/url\(\s*(["'])data:image\/(?:(?!\1)[^\n\r\\])*\1\s*\)/gi, '')
        .replace(/url\(\s*data:image\/[^)'"\s\\]*\)/gi, '');
    return !/url\s*\(/i.test(rest) && !UNSAFE_SAVED_CSS.test(rest);
};

/**
 * CSS entries saved with a setting the toolbar cannot rebuild yet (see below),
 * reduced to the plain ones.
 *
 * @param {*} css Saved `css` list of a feature attribute.
 * @return {Array} Entries safe to apply.
 */
const keepPlainCssEntries = (css) => {
    if (!Array.isArray(css)) {
        return [];
    }
    return css.filter((entry) => {
        if (!entry || typeof entry !== 'object' || !entry.properties || typeof entry.properties !== 'object') {
            return false;
        }
        const selector = entry.selector === undefined ? '*' : entry.selector;
        if (typeof selector !== 'string' || /[{}@;\\<\n\r]/.test(selector)) {
            return false;
        }
        return Object.entries(entry.properties).every(([property, value]) =>
            /^-?[a-zA-Z][a-zA-Z0-9-]*$/.test(property) && isSafeSavedCssValue(value)
        );
    });
};

/**
 * Saved tool settings, rebuilt from the feature definitions.
 *
 * A saved setting holds the CSS that was in force when it was saved. Only its
 * step is trusted now: the CSS comes from the current feature definition, so a
 * preference cannot bring CSS of its own onto the page, and an update to a
 * feature reaches visitors who saved it before. A custom colour is kept only as
 * a valid #rrggbb. A feature not defined yet (an add-on that loads after the
 * toolbar) keeps its saved setting, its CSS reduced to plain declarations
 * (keepPlainCssEntries()); out-of-range steps are dropped.
 *
 * @param {Object} saved Saved settings, by feature key.
 * @return {Object} Settings to apply, by feature key.
 */
const rebuildSavedSettings = (saved) => {
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) {
        return {};
    }

    const features = Array.isArray(window.wapHelpers?.features) ? window.wapHelpers.features : [];
    const rebuilt = {};

    Object.keys(saved).forEach((key) => {
        const setting = saved[key];
        if (!setting || typeof setting !== 'object') {
            return;
        }

        const step = Number(setting.currentStep || 0);
        if (!Number.isInteger(step) || step < 0) {
            return;
        }

        const feature = features.find((entry) => entry?.key === key);
        if (!feature) {
            const attribute = setting.currentAttribute;
            rebuilt[key] = {
                ...setting,
                currentStep: step,
                currentAttribute: attribute && typeof attribute === 'object'
                    ? { ...attribute, css: keepPlainCssEntries(attribute.css) }
                    : null,
            };
            return;
        }

        const attributes = Array.isArray(feature.attributes) ? feature.attributes : [];
        const isMultiStep = !!setting.isMultiStep;

        if (step === 0) {
            rebuilt[key] = { currentStep: 0, currentAttribute: null, isMultiStep };
            return;
        }

        if (step <= attributes.length) {
            rebuilt[key] = { currentStep: step, currentAttribute: attributes[step - 1], isMultiStep };
            return;
        }

        // The step after the last one: a custom colour (see feature-swatches.js).
        const swatch = String(setting.currentAttribute?.swatch || '');
        if (feature.allowCustomColor && step === attributes.length + 1 && /^#[0-9a-f]{6}$/i.test(swatch)) {
            rebuilt[key] = {
                currentStep: step,
                currentAttribute: {
                    /* translators: %s: colour code, e.g. #1677ff. */
                    name: sprintf(__("Custom color %s", "website-accessibility"), swatch),
                    value: 'custom',
                    swatch,
                    css: [],
                    /* translators: %s: feature name, e.g. "Text Color". */
                    enableAnnouncement: sprintf(__("%s set to a custom color.", "website-accessibility"), feature.label || ''),
                },
                isMultiStep,
            };
        }
    });

    return rebuilt;
};

const View = () => {
    const { defaultProfiles = [], useBrowserKey } = window.wapHelpers || {};
    // FrontendExtensions: optional add-on component rendered next to the toolbar (receives context + dispatch).
    const { PreviewButton, PreviewContent, Icon, WapDrawer, FrontendExtensions = null } = window?.wapComponents;
    const { profiles, currentPreset, currentPresetId, settings, nonce, restUrl, isUserLoggedIn } = window?.websiteAccessibility;
    const { dispatch, ...state } = useFrontendAccessibility();
    // Render again when the toolbar's language changes (strings are read live).
    useI18nVersion();
    // Opened from the launcher before the toolbar had loaded (src/launcher): start open.
    const [isOpen, setIsOpen] = useState(() => {
        const openNow = !!window.websacOpenOnStart;
        window.websacOpenOnStart = false;
        return openNow;
    });
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
            return 90;
        }
        const n = Number(raw);
        if (!Number.isFinite(n) || n <= 0) {
            return 90;
        }
        if (n > 100) return 90;
        return n;
    }, [currentPreset?.panel?.wrapper?.maxHeight]);

    const isPreferenceActive = useMemo(() => {
        const footerAttribiutes = currentPreset?.panel?.items?.find((item) => item.slug === 'footer')?.attributes;

        return footerAttribiutes?.activePreference || false;
    }, [currentPreset]);

    // Profiles this preset offers: the panel shows only these (see AccessibilityProfiles).
    const offeredProfileIds = useMemo(() => {
        const item = currentPreset?.panel?.items?.find((entry) => entry.slug === 'profiles');
        if (!item?.active) return [];
        return (item.attributes?.profiles || []).map((id) => String(id));
    }, [currentPreset]);

    // Whether the preset still offers a profile (by id).
    const isOffered = (id) => offeredProfileIds.includes(String(id));

    function validProfile(currentProfile) {
        if (!currentProfile?.id) return null;

        // A saved profile the preset no longer offers (switched off in the dashboard)
        // is not restored, and neither are the tools it switched on (see
        // applyPreferenceData): they left the panel with it, so there would be no way
        // to tell why they were on.
        if (!isOffered(currentProfile.id)) return null;

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
        // Tools that came from a profile go with it, even after a tile was changed
        // (which detaches the profile but keeps its tools).
        const origin = preferenceData.profile?.id ?? preferenceData.profileOrigin ?? null;
        const originGone = origin !== null && !isOffered(origin);

        if (validCurrentProfile?.id !== preferenceData?.profile?.id || originGone) {
            dispatch({ type: 'SET_CURRENT_SETTINGS', payload: {} });
            dispatch({ type: 'SET_PROFILE_ORIGIN', payload: null });
        } else {
            dispatch({ type: 'SET_CURRENT_SETTINGS', payload: rebuildSavedSettings(preferenceData.settings) });
            dispatch({ type: 'SET_PROFILE_ORIGIN', payload: origin });
        }
        dispatch({ type: 'SET_CURRENT_PROFILE', payload: validCurrentProfile });
        dispatch({ type: 'SET_OVERSIZED', payload: preferenceData.oversized || false });
        const selectedLanguage = preferenceData.selectedLanguage || null;
        dispatch({ type: 'SET_SELECTED_LANGUAGE', payload: selectedLanguage });
    }

    const saveablePreference = useMemo(() => {
        if (!currentPresetId) return null;
        const { currentProfile, profileOrigin, currentSettings, isOverSized, selectedLanguage } = state;

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

        // Tools changed after picking a profile still came from it (see applyPreferenceData).
        if (data.settings && !data.profile && profileOrigin != null) data.profileOrigin = profileOrigin;

        if (isOverSized) data.oversized = isOverSized;
        if (selectedLanguage) {
            data.selectedLanguage = selectedLanguage;
        }

        return { post_id: currentPresetId, data };
    }, [state?.currentProfile, state?.profileOrigin, state?.currentSettings, state?.isOverSized, state?.selectedLanguage, state?.siteLanguage]);

    useEffect(() => {
        if (!currentPresetId) return;

        const localKey = `${state?.localStorageKeyPrefix}-${currentPresetId}`;
        const localData = readLocalPreference(localKey);

        // ✅ Use API only if activePreference is true and user is logged in
        if (isPreferenceActive && isUserLoggedIn) {
            apiFetch({ path: `/websac/v1/preference?post_id=${currentPresetId}`, method: 'GET' })
                .then((response) => {
                    if (response?.success && response.data && Object.keys(response.data).length > 0) {
                        applyPreferenceData(response.data);

                        // Optional: sync localStorage for offline support
                        writeLocalPreference(localKey, response.data);
                    } else if (localData) {
                        applyPreferenceData(localData);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching preference:', error);
                    if (localData) {
                        applyPreferenceData(localData);
                    }
                });
        } else {
            // 🧩 Local mode (no API call)
            if (localData) {
                applyPreferenceData(localData);
            }
        }
    }, [currentPresetId, isPreferenceActive, isUserLoggedIn]);

    /**
     * Sync preferences to localStorage on change
     */
    useEffect(() => {
        if (!currentPresetId || !saveablePreference?.data) return;
        writeLocalPreference(`${state.localStorageKeyPrefix}-${currentPresetId}`, saveablePreference?.data);
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

        // The first run still has the blank initial settings: the saved ones are applied
        // (or found missing) by the effect above and arrive on a later run.
        if (state?.currentSettings !== initialState.currentSettings) {
            accessibilityManager().settleSavedPreferences();
        }

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
     * Opening the panel moves focus into it, so keyboard and screen-reader users
     * land in the dialog (it is aria-modal) instead of behind it. antd's own
     * autoFocus stays off: it scrolled some pages; this one does not scroll.
     * Closing returns focus to the launcher (antd does that).
     */
    const wasOpenRef = useRef(false);
    useEffect(() => {
        if (!isOpen) {
            // antd hands focus back to whatever had it before opening. For visitors
            // that was the PHP placeholder launcher, gone once the toolbar mounted,
            // so focus fell to <body>: send it to the real launcher instead.
            if (!wasOpenRef.current) return undefined;
            wasOpenRef.current = false;
            const timer = setTimeout(() => {
                const active = document.activeElement;
                if (!active || active === document.body || !active.isConnected) {
                    document.querySelector('#website-accessibility-app .wap-preview-button')?.focus({ preventScroll: true });
                }
            }, 350);
            return () => clearTimeout(timer);
        }
        wasOpenRef.current = true;
        let frame = requestAnimationFrame(() => {
            frame = requestAnimationFrame(() => {
                const dialog = document.querySelector('.wap-preset__preview-drawer-root .ant-drawer-content[role="dialog"]');
                if (!dialog || dialog.contains(document.activeElement)) return;
                if (!dialog.hasAttribute('tabindex')) dialog.setAttribute('tabindex', '-1');
                dialog.focus({ preventScroll: true });
            });
        });
        return () => cancelAnimationFrame(frame);
    }, [isOpen]);

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
                aria-haspopup="dialog"
                aria-expanded={isOpen}
            />
            <WapDrawer
                open={isOpen}
                onClose={closeAccessibilityDrawer}
                placement={currentPreset?.panel?.wrapper?.position || "right"}
                className={`wap-preset__preview-drawer notranslate wap-preset__preview-drawer--${currentPreset?.panel?.wrapper?.position || 'right'}`}
                rootClassName={`wap-preset__preview-drawer-root notranslate wap-preset__preview-drawer-root--${currentPreset?.panel?.wrapper?.position || 'right'}`}
                width={Number(currentPreset?.panel?.wrapper?.width) || 450}
                styles={{
                    wrapper: { maxHeight: `${drawerContentWrapperMaxHeightVh}vh` },
                }}
                mask={false}
                keyboard
                maskClosable={false}
                autoFocus={false}
                aria-label={__('Accessibility Menu', 'website-accessibility')}
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
