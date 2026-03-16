import { useEffect, useState } from "@wordpress/element";
import { EyeOutlined, EyeInvisibleOutlined, ReloadOutlined } from "@ant-design/icons";
import { __ } from "@wordpress/i18n";

const PanelHeader = ({ value, setIsOpen = () => { }, accessibilityContext, accessibilityDispatch }) => {
    const siteLanguage = window?.websiteAccessibility?.siteLanguage?.split("-")?.[0] || "en";
    const [openLanguageDropdown, setOpenLanguageDropdown] = useState(false);
    const [editorTranslationEnabled, setEditorTranslationEnabled] = useState(false);
    const [editorSelectedLanguage, setEditorSelectedLanguage] = useState(siteLanguage);
    const [headerElement, setHeaderElement] = useState(null);

    // Find the header item from value.items
    const headerItem = value?.items?.find(item => item.slug === 'header') || {};
    const attributes = headerItem.attributes || {};
    const panelWidth = value?.wrapper?.width || 420;
    const isProActive = window?.websacPro?.isProActive || false;
    const { TranslationLanguageDropdown, WapTooltip } = window?.wapComponents || {};
    const {
        getTranslationLanguageData = (() => null),
        getTranslationLanguageLabel = ((code) => code || __("Language", "website-accessibility")),
        getCookie = (() => null),
        removeCookie = (() => null),
    } = window?.wapHelpers || {};
    const { settings } = window?.websiteAccessibility || {};
    const isFrontend = !!accessibilityContext && !!accessibilityDispatch;
    const isTranslationForced = !!settings?.always_on_translations;
    const showTranslator = attributes?.showTranslator !== false;
    const translateConsent = getCookie("wapGoogleTranslateConsent");
    const isConsentDeclined = isFrontend && translateConsent === "false";
    const isConsentAccepted = isFrontend && translateConsent === "true";
    const hasTranslateConsent = isFrontend && !!translateConsent;
    const isTranslationEnabled = isFrontend
        ? (isTranslationForced || !!accessibilityContext?.enableTranslations)
        : editorTranslationEnabled;
    const selectedLanguage = isFrontend
        ? (accessibilityContext?.selectedLanguage || accessibilityContext?.siteLanguage || siteLanguage)
        : editorSelectedLanguage;
    const selectedLanguageData = getTranslationLanguageData(selectedLanguage);
    const tooltipProps = {
        placement: "bottom",
        mouseEnterDelay: 0,
        getPopupContainer: () => document.body,
        styles: {
            root: { zIndex: 9999999999 }
        }
    };

    useEffect(() => {
        if (!isFrontend || !showTranslator || !isProActive) return;
        if (accessibilityContext?.selectedLanguage) return;

        accessibilityDispatch({
            type: "SET_SELECTED_LANGUAGE",
            payload: accessibilityContext?.siteLanguage || siteLanguage,
        });
    }, [
        isFrontend,
        showTranslator,
        isProActive,
        accessibilityContext?.selectedLanguage,
        accessibilityContext?.siteLanguage,
        accessibilityDispatch,
    ]);

    // Build CSS variables from attributes
    const styleVars = {
        '--wap-header-bg': attributes.background,
        '--wap-header-border': attributes.border,
        '--wap-header-radius': attributes.borderRadius,
        '--wap-header-shadow': attributes.boxShadow,
        '--wap-header-padding': attributes.padding,
        '--wap-header-color': attributes.color,
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

    const handleToggleTranslation = () => {
        if (!isFrontend) {
            const nextValue = !editorTranslationEnabled;
            setEditorTranslationEnabled(nextValue);

            if (nextValue && !editorSelectedLanguage) {
                setEditorSelectedLanguage(siteLanguage);
            }

            if (!nextValue) {
                setOpenLanguageDropdown(false);
            }

            return;
        }

        const nextValue = !isTranslationEnabled;
        accessibilityDispatch({
            type: "SET_ENABLE_TRANSLATIONS",
            payload: nextValue,
        });

        if (nextValue && !accessibilityContext?.selectedLanguage) {
            accessibilityDispatch({
                type: "SET_SELECTED_LANGUAGE",
                payload: accessibilityContext?.siteLanguage || siteLanguage,
            });
        }

        if (!nextValue) {
            setOpenLanguageDropdown(false);
        }
    };

    const handleLanguageChange = (languageCode) => {
        if (!isFrontend) {
            setEditorSelectedLanguage(languageCode);
            return;
        }

        accessibilityDispatch({
            type: "SET_SELECTED_LANGUAGE",
            payload: languageCode,
        });
    };

    const handleClearConsent = () => {
        if (!isFrontend) return;
        removeCookie("wapGoogleTranslateConsent");
        window.location.reload();
    };

    return (
        <div
            ref={setHeaderElement}
            className={`wap-panel-customization__header${attributes.flipContent ? ' wap-panel-customization__header--flipped' : ''}`}
            style={styleVars}
        >
            <span
                className="wap-panel-customization__header-title"
            >
                {attributes.text || 'Accessibility Menu (CTRL+U)'}
            </span>
            <div className="wap-panel-customization__header-actions">
                {isProActive && showTranslator && hasTranslateConsent && (
                    <WapTooltip
                        title={__("Clear translation consent", "website-accessibility")}
                        {...tooltipProps}
                    >
                        <button
                            type="button"
                            className="wap-panel-customization__header-action-btn"
                            onClick={handleClearConsent}
                            title={__("Clear translation consent", "website-accessibility")}
                        >
                            <ReloadOutlined />
                        </button>
                    </WapTooltip>
                )}

                {isProActive && showTranslator && !isConsentDeclined && (!isFrontend || isConsentAccepted) && TranslationLanguageDropdown && (
                    <>
                        {!isTranslationForced && (
                            <WapTooltip
                                title={isTranslationEnabled ? __("Disable translation", "website-accessibility") : __("Enable translation", "website-accessibility")}
                                {...tooltipProps}
                            >
                                <button
                                    type="button"
                                    className={`wap-panel-customization__header-action-btn ${isTranslationEnabled ? "is-active" : ""}`}
                                    onClick={handleToggleTranslation}
                                    aria-pressed={isTranslationEnabled}
                                    title={isTranslationEnabled ? __("Disable translation", "website-accessibility") : __("Enable translation", "website-accessibility")}
                                >
                                    {isTranslationEnabled ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                </button>
                            </WapTooltip>
                        )}

                        <TranslationLanguageDropdown
                            open={openLanguageDropdown}
                            onOpenChange={setOpenLanguageDropdown}
                            value={selectedLanguage}
                            onChange={handleLanguageChange}
                            dropdownWidth={panelWidth}
                            portalTarget={headerElement}
                            trigger={
                                <WapTooltip
                                    title={__("Choose translation language", "website-accessibility")}
                                    {...tooltipProps}
                                >
                                    <button
                                        type="button"
                                        className="wap-panel-customization__header-action-btn wap-panel-customization__header-action-btn--language"
                                        title={__("Choose translation language", "website-accessibility")}
                                    >
                                        {selectedLanguageData?.flag && (
                                            <span className="wap-panel-customization__header-action-flag">
                                                {selectedLanguageData.flag}
                                            </span>
                                        )}
                                        <span className="wap-panel-customization__header-action-language">
                                            {getTranslationLanguageLabel(selectedLanguage)}
                                        </span>
                                    </button>
                                </WapTooltip>
                            }
                        />
                    </>
                )}

                <span className="wap-panel-customization__header-close" onClick={() => setIsOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </span>
            </div>
        </div>
    );
};

export default PanelHeader;
