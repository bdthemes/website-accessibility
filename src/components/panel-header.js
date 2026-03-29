import { useEffect, useMemo, useState } from "@wordpress/element";
import { EyeOutlined, EyeInvisibleOutlined, ReloadOutlined } from "@ant-design/icons";
import { __ } from "@wordpress/i18n";

const PanelHeader = ({
    value,
    setIsOpen = () => { },
    accessibilityContext,
    accessibilityDispatch,
    isEditorPreview = false,
    languageDropdownOpen: languageDropdownOpenProp,
    onLanguageDropdownOpenChange,
}) => {
    const siteLanguage = window?.websiteAccessibility?.siteLanguage?.split("-")?.[0] || "en";
    const [internalLanguageDropdownOpen, setInternalLanguageDropdownOpen] = useState(false);
    const isLanguageDropdownControlled = typeof onLanguageDropdownOpenChange === "function";
    const openLanguageDropdown = isLanguageDropdownControlled ? !!languageDropdownOpenProp : internalLanguageDropdownOpen;
    const setOpenLanguageDropdown = isLanguageDropdownControlled
        ? onLanguageDropdownOpenChange
        : setInternalLanguageDropdownOpen;
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
    const isFrontend = !isEditorPreview && !!accessibilityContext && !!accessibilityDispatch;
    const isTranslationForced = !!settings?.always_on_translations;
    const showTranslator = attributes?.showTranslator !== false;
    const translateConsent = useMemo(() => (
        isFrontend ? getCookie("wapGoogleTranslateConsent") : null
    ), [getCookie, isFrontend]);
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
             <svg className="wap-panel-customization__header-icon" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24.0557 37.04C24.4857 40.37 25.3357 43.4902 26.5557 46.1602H21.5557C22.7757 43.4902 23.6257 40.37 24.0557 37.04ZM31.3262 2C32.066 2.00014 32.7256 2.46026 32.9756 3.16016L46.0459 43.8096L46.0361 43.7803C46.4458 44.9202 45.5956 46.1299 44.3857 46.1299H31.9658C31.9458 46.0799 31.9255 46.0402 31.8955 45.9902C30.0355 42.8902 28.8257 38.45 28.5957 33.79C28.5157 32.02 28.5561 30.2698 28.7461 28.5898C31.026 28.2898 33.1961 27.7602 35.166 27.0303C36.4158 26.5703 37.0456 25.1903 36.5859 23.9404C36.126 22.6906 34.746 22.0598 33.4961 22.5195C30.6961 23.5595 27.3657 24.1104 23.8857 24.1104C20.4058 24.1103 17.156 23.5696 14.376 22.5596C13.126 22.1096 11.7462 22.7501 11.2861 24C10.8362 25.2499 11.4758 26.6297 12.7256 27.0898C14.7556 27.8298 17.016 28.3504 19.376 28.6504C19.5559 30.3201 19.6056 32.0499 19.5156 33.8096C19.2856 38.4695 18.0758 42.9098 16.2158 46.0098L16.1455 46.1504H3.75586C2.5559 46.1504 1.70579 44.97 2.0957 43.8301L14.5361 3.19043C14.7761 2.48043 15.4463 2 16.1963 2H31.3262ZM27.7559 18.3301C27.5559 16.3001 25.7458 14.8196 23.7158 15.0195C21.6859 15.2195 20.2065 17.0297 20.4062 19.0596C20.6063 21.0896 22.4163 22.5701 24.4463 22.3701C26.476 22.1699 27.9558 20.3599 27.7559 18.3301Z" fill="#ffffff" />
              </svg>
            <span
                className="wap-panel-customization__header-title"
            >
                {attributes.text || 'Accessibility'}
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
