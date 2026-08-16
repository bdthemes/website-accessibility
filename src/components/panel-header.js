import { useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import PanelBrandIcon from "./panel-brand-icon";

const PanelHeader = ({
    value,
    setIsOpen = () => { },
    accessibilityContext,
    accessibilityDispatch,
    isEditorPreview = false,
    headerDropdownOpen: headerDropdownOpenProp,
    onHeaderDropdownOpenChange,
}) => {
    const [internalHeaderDropdownOpen, setInternalHeaderDropdownOpen] = useState(false);
    const isHeaderDropdownControlled = typeof onHeaderDropdownOpenChange === "function";
    const headerDropdownOpen = isHeaderDropdownControlled ? !!headerDropdownOpenProp : internalHeaderDropdownOpen;
    const setHeaderDropdownOpen = isHeaderDropdownControlled
        ? onHeaderDropdownOpenChange
        : setInternalHeaderDropdownOpen;
    const [headerElement, setHeaderElement] = useState(null);

    // Find the header item from value.items
    const headerItem = value?.items?.find(item => item.slug === 'header') || {};
    const attributes = headerItem.attributes || {};
    const panelWidth = value?.wrapper?.width || 420;
    // Optional extra header actions contributed by an add-on (rendered between "Reset all" and the close button).
    const { PanelHeaderActions, WapTooltip } = window?.wapComponents || {};
    const [messageApi, contextHolder] = (window?.wapComponents?.WapMessage || {}).useMessage?.() || [];
    const isFrontend = !isEditorPreview && !!accessibilityContext && !!accessibilityDispatch;
    const tooltipProps = {
        placement: "bottom",
        mouseEnterDelay: 0,
        getPopupContainer: () => document.body,
        styles: {
            root: { zIndex: 9999999999 }
        }
    };

    // Build CSS variables from attributes
    const styleVars = {
        '--wap-header-bg': attributes.background,
        '--wap-header-border': attributes.border,
        '--wap-header-radius': attributes.borderRadius,
        '--wap-header-shadow': attributes.boxShadow,
        '--wap-header-padding': attributes.padding,
        '--wap-header-color': attributes.color,
        ...(attributes.iconColor ? { '--wap-header-icon-color': attributes.iconColor } : {}),
        '--wap-header-font-size': attributes.fontSize,
        '--wap-header-font-weight': attributes.fontWeight,
        '--wap-header-text-decoration': attributes.textDecoration,
        '--wap-close-button-bg': attributes.closeButtonBackground,
        '--wap-close-button-color': attributes.closeButtonColor,
        '--wap-close-button-size': attributes.closeButtonSize,
        '--wap-close-button-border': attributes.closeButtonBorder,
        '--wap-close-button-border-radius': attributes.closeButtonBorderRadius,
        '--wap-close-button-top': attributes.closeButtonTop,
        '--wap-close-button-right': attributes.closeButtonRight,
    };

    const handleResetAll = () => {
        if (!isFrontend) return;

        // Ensure any open header dropdown closes immediately after reset.
        setHeaderDropdownOpen(false);

        // Reset accessibility features/profiles.
        accessibilityDispatch({ type: "RESET_ACCESSIBILITY" });

        // Let add-ons reset whatever state they keep alongside the toolbar.
        if (typeof document !== "undefined") {
            document.dispatchEvent(new CustomEvent("websac-accessibility-reset", {
                detail: { accessibilityContext, accessibilityDispatch },
            }));
        }

        messageApi?.info?.({
            content: __("All accessibility settings have been reset to default.", "website-accessibility"),
            style: { marginBlockStart: 20 },
        });
    };

    return (
        <div
            ref={setHeaderElement}
            className={`wap-panel-customization__header${attributes.flipContent ? ' wap-panel-customization__header--flipped' : ''}`}
            style={styleVars}
        >
            {contextHolder}
            <PanelBrandIcon variant="header" />
            <span
                className="wap-panel-customization__header-title"
            >
                {__('Accessibility', 'website-accessibility')}
            </span>
            <div className="wap-panel-customization__header-actions">
                <WapTooltip
                    title={__("Reset all", "website-accessibility")}
                    {...tooltipProps}
                >
                    <button
                        type="button"
                        className="wap-panel-customization__header-action-btn"
                        onClick={handleResetAll}
                        title={__("Reset all", "website-accessibility")}
                    >
                        {/* <ReloadOutlined /> */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-rotate-ccw-icon lucide-rotate-ccw"
                        >
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                        </svg>


                    </button>
                </WapTooltip>

                {PanelHeaderActions ? (
                    <PanelHeaderActions
                        attributes={attributes}
                        isFrontend={isFrontend}
                        isEditorPreview={isEditorPreview}
                        accessibilityContext={accessibilityContext}
                        accessibilityDispatch={accessibilityDispatch}
                        panelWidth={panelWidth}
                        portalTarget={headerElement}
                        dropdownOpen={headerDropdownOpen}
                        onDropdownOpenChange={setHeaderDropdownOpen}
                        tooltipProps={tooltipProps}
                    />
                ) : null}

                <span className="wap-panel-customization__header-close-separator"></span>
                <span
                    className="wap-panel-customization__header-close"
                    onPointerDown={(e) => {
                        if (e.pointerType === 'mouse' && e.button !== 0) {
                            return;
                        }
                        e.stopPropagation();
                        try {
                            e.currentTarget.setPointerCapture(e.pointerId);
                        } catch {
                            /* setPointerCapture unsupported or invalid id */
                        }
                    }}
                    onPointerUp={(e) => {
                        try {
                            e.currentTarget.releasePointerCapture(e.pointerId);
                        } catch {
                            /* not capturing this pointer */
                        }
                    }}
                    onPointerCancel={(e) => {
                        try {
                            e.currentTarget.releasePointerCapture(e.pointerId);
                        } catch {
                            /* not capturing this pointer */
                        }
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsOpen(false);
                    }}
                >
                    <svg
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5.29303 5.29297C5.48056 5.10549 5.73487 5.00018 6.00003 5.00018C6.26519 5.00018 6.5195 5.10549 6.70703 5.29297L12 10.586L17.293 5.29297C17.3853 5.19745 17.4956 5.12127 17.6176 5.06886C17.7396 5.01645 17.8709 4.98887 18.0036 4.98771C18.1364 4.98656 18.2681 5.01186 18.391 5.06214C18.5139 5.11242 18.6255 5.18668 18.7194 5.28057C18.8133 5.37446 18.8876 5.48611 18.9379 5.60901C18.9881 5.73191 19.0134 5.86359 19.0123 5.99637C19.0111 6.12915 18.9835 6.26037 18.9311 6.38237C18.8787 6.50437 18.8025 6.61472 18.707 6.70696L13.414 12L18.707 17.293C18.8892 17.4816 18.99 17.7342 18.9877 17.9964C18.9854 18.2586 18.8803 18.5094 18.6948 18.6948C18.5094 18.8802 18.2586 18.9854 17.9964 18.9877C17.7342 18.99 17.4816 18.8892 17.293 18.707L12 13.414L6.70703 18.707C6.51843 18.8892 6.26583 18.99 6.00363 18.9877C5.74143 18.9854 5.49062 18.8802 5.30521 18.6948C5.1198 18.5094 5.01463 18.2586 5.01236 17.9964C5.01008 17.7342 5.11087 17.4816 5.29303 17.293L10.586 12L5.29303 6.70696C5.10556 6.51944 5.00024 6.26513 5.00024 5.99996C5.00024 5.7348 5.10556 5.48049 5.29303 5.29297Z"
                            fill="currentColor"
                        />
                    </svg>

                </span>
            </div>
        </div>
    );
};

export default PanelHeader;
