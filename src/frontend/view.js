import { useState, useMemo, useEffect } from "@wordpress/element";
import clsx from "clsx";
import { Drawer } from "antd";
import { useAccessibility, useAccessibilityActions } from "./context";
import { defaultProfiles } from "../utils";

const View = () => {
    const { PreviewButton, PreviewContent, Icon } = window?.wapComponents;
    const { presets, profiles, pageType } = window?.websiteAccessibility;
    
    // Access accessibility context
    const { 
        currentProfile, 
        settings, 
        isLoading, 
        isInitialized,
        savedPreferences 
    } = useAccessibility();
    
    const { 
        setProfile, 
        updateSetting, 
        resetAll, 
        savePreferences 
    } = useAccessibilityActions();

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

    // Apply saved preferences on mount
    useEffect(() => {
        if (isInitialized && savedPreferences) {
        }
    }, [isInitialized, savedPreferences]);

    // Handle profile selection
    const handleProfileSelect = (profile) => {
        setProfile(profile);
    };

    // Handle setting updates
    const handleSettingUpdate = (key, value) => {
        updateSetting(key, value);
    };

    // Handle reset
    const handleReset = () => {
        resetAll();
    };

    // Handle save preferences
    const handleSavePreferences = () => {
        const success = savePreferences();
        if (success) {
            setIsOpen(false);
        } else {
            console.error('Failed to save accessibility preferences');
        }
    };

    // Create accessibility context object for components
    const accessibilityContext = {
        currentProfile,
        settings,
        isLoading,
        isInitialized,
        setProfile: handleProfileSelect,
        updateSetting: handleSettingUpdate,
        resetAll: handleReset,
        savePreferences: handleSavePreferences
    };

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
                    accessibilityContext={accessibilityContext}
                />
            </Drawer>
        </div>
    );
};

export default View;