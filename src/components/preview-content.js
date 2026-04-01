import { useRef, cloneElement, useState, useEffect, useLayoutEffect } from "@wordpress/element";
import clsx from "clsx";


const PreviewContent = ({
    panel,
    allProfiles,
    setIsOpen = () => { },
    accessibilityContext,
    accessibilityDispatch,
    isOpen,
    isEditorPreview = false,
}) => {
    const { AccessibilityProfiles, WidgetFeatures, PanelHeader, PanelFooter } = window?.wapComponents;
    const { useDrawerScrollControl } = window.wapHelpers;
    const isProActive = window?.websacPro?.isProActive || false;
    const { isOverSized } = accessibilityContext || {};

    const panelRef = useRef(null);
    const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
    const lockedPanelScrollTopRef = useRef(0);

    // In preset editor preview, body scroll lock on mouseenter/mouseleave causes admin layout jitter.
    // Keep drawer scroll lock for real frontend panel only.
    useDrawerScrollControl(panelRef, isOpen && !isEditorPreview);

    /**
     * True if the event is inside the translation language UI (inner list must keep wheel/touch scroll).
     * Walks DOM ancestors from target (fixes text nodes) — do not use document-capture wheel; it runs before
     * the list handles the event and can block scrolling up (deltaY < 0).
     */
    const isEventInsideLanguageDropdown = (event) => {
        const matchesLanguageUi = (node) => {
            if (!node || node.nodeType !== 1) return false;
            const cl = node.classList;
            if (!cl || !cl.length) return false;
            for (let j = 0; j < cl.length; j += 1) {
                const name = cl[j];
                if (
                    name.includes("wap-translation-dropdown")
                    || name.includes("ant-dropdown")
                ) {
                    return true;
                }
            }
            return false;
        };

        let el = event.target;
        if (el && el.nodeType === 3) {
            el = el.parentElement;
        }
        const panel = panelRef.current;
        while (el && el !== panel && el !== document.body) {
            if (matchesLanguageUi(el)) return true;
            el = el.parentElement;
        }

        const path = typeof event.composedPath === "function" ? event.composedPath() : [];
        for (let i = 0; i < path.length; i += 1) {
            if (matchesLanguageUi(path[i])) return true;
        }
        return false;
    };

    useLayoutEffect(() => {
        if (languageDropdownOpen && panelRef.current) {
            lockedPanelScrollTopRef.current = panelRef.current.scrollTop;
        }
    }, [languageDropdownOpen]);

    useEffect(() => {
        if (!languageDropdownOpen) return;
        const panel = panelRef.current;
        if (!panel) return;

        const lockScrollTop = () => {
            const y = lockedPanelScrollTopRef.current;
            if (panel.scrollTop !== y) {
                panel.scrollTop = y;
            }
        };

        /** Bubble phase only — capture-phase wheel on document was blocking upward scroll inside the list */
        const onWheelPanel = (e) => {
            if (isEventInsideLanguageDropdown(e)) return;
            e.preventDefault();
        };

        panel.addEventListener("scroll", lockScrollTop, { passive: true });
        panel.addEventListener("wheel", onWheelPanel, { passive: false });

        return () => {
            panel.removeEventListener("scroll", lockScrollTop);
            panel.removeEventListener("wheel", onWheelPanel);
        };
    }, [languageDropdownOpen]);

    useEffect(() => {
        if (!languageDropdownOpen) return;
        const onKeyDown = (e) => {
            if (e.key === "Escape") {
                setLanguageDropdownOpen(false);
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [languageDropdownOpen]);

    // Create components with accessibility context
    const itemComponents = {
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
        <div
            ref={panelRef}
            className={
                clsx(
                    "wap-panel-customization__panel",
                    "notranslate",
                    {
                        "wap-panel-customization__panel--oversized": isOverSized,
                        "wap-panel-customization__panel--language-dropdown-open": languageDropdownOpen,
                    }
                )
            }
            translate="no"
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
                            accessibilityDispatch={accessibilityDispatch}
                            isEditorPreview={isEditorPreview}
                            languageDropdownOpen={languageDropdownOpen}
                            onLanguageDropdownOpenChange={setLanguageDropdownOpen}
                        />
                    )
                }
                <div className="wap-panel-customization__body">
                    <div className="wap-panel-customization__main">
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
                                isEditorPreview={isEditorPreview}
                            />
                        )
                    }
                    {languageDropdownOpen && (
                        <div
                            className="wap-language-panel-overlay"
                            role="presentation"
                            aria-hidden="true"
                            onClick={() => setLanguageDropdownOpen(false)}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default PreviewContent;
