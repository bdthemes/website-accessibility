import { useState, useMemo, useEffect } from "@wordpress/element";
import clsx from "clsx";
import { Drawer } from "antd";
import { defaultProfiles } from "../utils";
import useFrontendAccessibility from "./context/useAccessibility";
import accessibilityManager from "../accessibilty-manager";
import { __ } from "@wordpress/i18n";
const View = () => {
    const screenReader = window.wapHelpers?.screenReader || (() => null);
    const { PreviewButton, PreviewContent, Icon } = window?.wapComponents;
    const { profiles, currentPreset, currentPresetId } = window?.websiteAccessibility;
    const { dispatch, ...state } = useFrontendAccessibility();
    const [isOpen, setIsOpen] = useState(false);

    const allProfiles = useMemo(() => {
        return [
            ...defaultProfiles,
            ...profiles || [],
        ];
    }, [profiles]);


    useEffect(() => {
        if (currentPresetId) {
            const currentLocalItem = localStorage.getItem(`${state?.localStorageKeyPrefix}-${currentPresetId}`);

            if (currentLocalItem) {
                const initialLocalPreferences = JSON.parse(currentLocalItem);
                dispatch({
                    type: 'SET_CURRENT_PROFILE',
                    payload: initialLocalPreferences?.profile || null,
                });
                dispatch({
                    type: 'SET_CURRENT_SETTINGS',
                    payload: initialLocalPreferences?.settings || {},
                });
                dispatch({
                    type: 'SET_OVERSIZED',
                    payload: initialLocalPreferences?.oversized || false,
                });

                dispatch({
                    type: 'SET_ENABLE_TRANSLATIONS',
                    payload: initialLocalPreferences?.enableTranslations || false,
                });
                dispatch({
                    type: 'SET_SELECTED_LANGUAGE',
                    payload: initialLocalPreferences?.selectedLanguage || null,
                });
            }
        }
    }, [currentPresetId]);

    useEffect(() => {
        if (!currentPresetId) return;
        const { currentProfile, currentSettings, isOverSized, enableTranslations, selectedLanguage } = state;
        
        // Create a serializable version of currentProfile
        const serializableProfile = {
            id: currentProfile?.id,
            name: currentProfile?.name,
            // Check if the icon is a React element and extract only the necessary data
            icon: currentProfile?.icon && currentProfile?.icon.props && currentProfile.icon.props.dangerouslySetInnerHTML
                ? { __html: currentProfile.icon.props.dangerouslySetInnerHTML.__html } // Store just the HTML string
                : currentProfile?.icon, // If it's the simpler object or not present, store as is
            settings: currentSettings // settings look good as they are plain data
        };

        const localPreferences = {
            profile: serializableProfile,
            settings: currentSettings, // Assuming currentSettings is always serializable
            oversized: isOverSized,
            enableTranslations: enableTranslations,
            selectedLanguage: enableTranslations ? selectedLanguage : null
        };

        localStorage.setItem(`${state.localStorageKeyPrefix}-${currentPresetId}`, JSON.stringify(localPreferences));
    }, [state, currentPresetId]);

    useEffect(() => {
        accessibilityManager().init(state?.currentSettings);
    }, [state]);

    useEffect(() => {
        window.addEventListener('keydown', (e) => {
            // ESC closes the menu if it's open
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }

            // Ctrl + U opens the menu if it's closed
            if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
                e.preventDefault(); // prevent browser "view source" shortcut
                setIsOpen(true);
            }
        });
    }, []);

    useEffect(() => {
        const currentSettings = state?.currentSettings;
        if (!currentSettings?.screenReader?.currentStep) return;
        if (isOpen) {
            screenReader()?.speak(__('Accessibility Menu Open', 'website-accessibility'));
        } else {
            screenReader()?.speak(__('Accessibility Menu Close', 'website-accessibility'));
        }
    }, [isOpen]);

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

    useEffect(() => {
        if (typeof window.google !== "undefined" && window.google.translate) {
            window.wapGoogleTranslateInit();
        }
    }, [])

    if (!currentPreset) {
        return null;
    }

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
            <Drawer
                open={isOpen}
                onClose={() => setIsOpen(false)}
                placement="right"
                className="wap-preset__preview-drawer"
                rootClassName="wap-preset__preview-drawer-root"
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
            </Drawer>
        </div>
    );
};

export default View;