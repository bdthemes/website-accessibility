import { useState, useMemo, useEffect } from "@wordpress/element";
import clsx from "clsx";
import { Drawer } from "antd";
import { defaultProfiles } from "../utils";
import useFrontendAccessibility from "./context/useAccessibility";
import accessibilityManager from "../accessibilty-manager";
import { __ } from "@wordpress/i18n";
import screenReader from "../screen-reader";
const View = () => {
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
                    payload: initialLocalPreferences.profile || null,
                });
                dispatch({
                    type: 'SET_CURRENT_SETTINGS',
                    payload: initialLocalPreferences.settings || {},
                });
                dispatch({
                    type: 'SET_OVERSIZED',  
                    payload: initialLocalPreferences.oversized || false,
                });
            }
        }
    }, [currentPresetId]);

    useEffect(() => {
        if (!currentPresetId) return;
        const { currentProfile, currentSettings, isOverSized } = state;
        const localPreferences = {
            profile: currentProfile,
            settings: currentSettings,
            oversized: isOverSized,
        };
        localStorage.setItem(`${state.localStorageKeyPrefix}-${currentPresetId}`, JSON.stringify(localPreferences));
    }, [state, currentPresetId]);

    useEffect(() => {
        accessibilityManager().init(state?.currentSettings);
    }, [state]);

    useEffect(() => {
        const currentSettings = state?.currentSettings;
        if (!currentSettings?.screenReader?.currentStep) return;
        if (isOpen) {
            screenReader().speak(__('Accessibility Menu Open', 'website-accessibility'));
        } else {
            screenReader().speak(__('Accessibility Menu Close', 'website-accessibility'));
        }
    }, [isOpen]);

    if (!currentPreset) {
        return null;
    }
    
    return (
        <div className="wap-accessibility-view">
            <PreviewButton 
                type="default"
                text={currentPreset?.button?.text}
                icon={currentPreset?.button?.showIcon ? <Icon name={currentPreset?.button?.icon} /> : null}
                className={clsx('wap-button-style-preset__preview-btn', currentPreset?.button?.position)}
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
                    accessibilityContext={state}
                    accessibilityDispatch={dispatch}
                />
            </Drawer>
        </div>
    );
};

export default View;