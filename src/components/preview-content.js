import { cloneElement } from "@wordpress/element";

const PreviewContent = ({ panel, allProfiles, setIsOpen = () => {}, accessibilityContext, accessibilityDispatch }) => {
    const { LanguageSelector = () => null, AccessibilityProfiles, WidgetFeatures, PanelHeader, PanelFooter } = window?.wapComponents;
    const isProActive = window?.websacPro?.isProActive || false;
    // Create components with accessibility context
    const itemComponents = {
        language: <LanguageSelector 
            value={panel} 
            accessibilityContext={accessibilityContext}
            accessibilityDispatch={accessibilityDispatch}
        /> || null,
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
                    <div className="wap-panel-customization__header-info">
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
                                    const Component = itemComponents?.[item?.slug];
                                    
                                    if (!Component) return null;

                                    // Must be active
                                    if (!item.active) return null;

                                    // If item is pro, also check isProActive
                                    if (item?.isPro && !isProActive) return null;

                                    return cloneElement(Component, { key: item.slug });
                                })
                            }

                        </div>
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