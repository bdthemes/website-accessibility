import { cloneElement } from "@wordpress/element";

const PreviewContent = ({ panel, allProfiles, setIsOpen = () => {}, accessibilityContext, accessibilityDispatch }) => {
    const { LanguageSelector, AccessibilityProfiles, WidgetFeatures, PanelHeader, PanelFooter } = window?.wapComponents;
    
    // Create components with accessibility context
    const itemComponents = {
        language: <LanguageSelector 
            value={panel} 
            accessibilityContext={accessibilityContext}
            accessibilityDispatch={accessibilityDispatch}
        />,
        profiles: <AccessibilityProfiles 
            value={panel} 
            allProfiles={allProfiles} 
            accessibilityContext={accessibilityContext}
            accessibilityDispatch={accessibilityDispatch}
        />,
        features: <WidgetFeatures 
            value={panel} 
            accessibilityContext={accessibilityContext}
            accessibilityDispatch={accessibilityDispatch}
        />,
    }

    return (
        <>
            <div 
                className="wap-panel-customization__panel"
                style={{
                    '--panel-width': panel?.wrapper?.width && `${panel.wrapper.width}px`,
                    '--panel-background': panel?.wrapper?.background,
                    '--panel-border': panel?.wrapper?.border,
                    '--panel-padding': panel?.wrapper?.padding,
                    '--panel-border-radius': panel?.wrapper?.borderRadius,
                    '--panel-box-shadow': panel?.wrapper?.boxShadow,
                }}
            >
                {
                    panel?.items?.find((item) => item.slug === 'header')?.active && (
                        <PanelHeader 
                            value={panel} 
                            setIsOpen={setIsOpen}
                            accessibilityContext={accessibilityContext}
                        />
                    )
                }
                <div className="wap-panel-customization__info">
                    {
                        panel?.items?.map((item) => {
                            if (itemComponents[item.slug] && item.active) {
                                return cloneElement(itemComponents[item.slug], { key: item.slug });
                            }
                            return null;
                        })
                    }
                </div>
                {
                    panel?.items?.find((item) => item.slug === 'footer')?.active && (
                        <PanelFooter 
                            value={panel} 
                            accessibilityContext={accessibilityContext}
                            accessibilityDispatch={accessibilityDispatch}
                        />
                    )
                }
            </div>
        </>
    )
}

export default PreviewContent; 