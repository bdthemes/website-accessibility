import { useState, useMemo, useEffect } from "@wordpress/element";
import clsx from "clsx";
import { Drawer } from "antd";
import { defaultProfiles } from "../utils";
import useFrontendAccessibility from "./context/useAccessibility";

const View = () => {
    const { PreviewButton, PreviewContent, Icon } = window?.wapComponents;
    const { presets, profiles, pageType } = window?.websiteAccessibility;
    const { dispatch, ...state } = useFrontendAccessibility();
    const [isOpen, setIsOpen] = useState(false);
    
    const currentPreset = useMemo(() => {
        return presets.find((preset) => preset.preset.condition === pageType);
    }, [presets, pageType]);

    const allProfiles = useMemo(() => {
        return [
            ...defaultProfiles,
            ...profiles || [],
        ];
    }, [profiles]);

    useEffect(() => {
        if (currentPreset?.id) {
            const currentLocalItem = localStorage.getItem(`${state?.localStorageKey}-${currentPreset?.id}`);
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
    }, [currentPreset]);

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
            />
            <Drawer
                open={isOpen}
                onClose={() => setIsOpen(false)}
                width={'auto'}
                className="wap-preset__preview-drawer"
                rootClassName="wap-preset__preview-drawer-root"
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