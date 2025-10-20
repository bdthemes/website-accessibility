import { cloneElement } from "@wordpress/element";
import clsx from "clsx";
import { useEffect, useState } from "@wordpress/element";
import { useMemo } from "react";

const getCookie = (name) => {
    return document.cookie.split("; ").reduce((r, v) => {
        const parts = v.split("=");
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, "");
};


const PreviewContent = ({ panel, allProfiles, setIsOpen = () => { }, accessibilityContext, accessibilityDispatch }) => {
    const { LanguageSelector = () => null, AccessibilityProfiles, WidgetFeatures, PanelHeader, PanelFooter } = window?.wapComponents;
    const isProActive = window?.websacPro?.isProActive || false;
    const { isOverSized } = accessibilityContext || {};
    const { settings } = window?.websiteAccessibility || {};
    const [consent, setConsent] = useState(false);

    useEffect(() => {
        const consent = getCookie("wapGoogleTranslateConsent");
        setConsent(consent === "true");
    }, []);

    const Translation = useMemo(() => {
        const showConsent = settings?.show_translations_consent;
        if (showConsent && !consent) return null;

        return (
            <LanguageSelector
                value={panel}
                accessibilityContext={accessibilityContext}
                accessibilityDispatch={accessibilityDispatch}
            />
        );
    }, [consent, settings?.show_translations_consent, accessibilityContext, accessibilityDispatch, panel]);

    // Create components with accessibility context
    const itemComponents = {
        language: Translation,
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
                className={
                    clsx(
                        "wap-panel-customization__panel",
                        {
                            "wap-panel-customization__panel--oversized": isOverSized
                        }
                    )
                }
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