import { useState } from "@wordpress/element";
import { TranslationOutlined, EyeInvisibleOutlined, GlobalOutlined } from "@ant-design/icons";
import { __ } from "@wordpress/i18n";
import TranslationLanguageDropdown, { getLanguageLabel } from "./translation-language-dropdown";

const PanelHeader = ({ value, setIsOpen = () => {}, accessibilityContext, accessibilityDispatch }) => {
    const [openLanguageDropdown, setOpenLanguageDropdown] = useState(false);
    
    // Find the header item from value.items
    const headerItem = value?.items?.find(item => item.slug === 'header') || {};
    const attributes = headerItem.attributes || {};
    const { settings } = window?.websiteAccessibility || {};
    const isFrontend = !!accessibilityContext && !!accessibilityDispatch;
    const isTranslationForced = !!settings?.always_on_translations;
    const isTranslationEnabled = isTranslationForced || !!accessibilityContext?.enableTranslations;
    const selectedLanguage = accessibilityContext?.selectedLanguage || accessibilityContext?.siteLanguage || "en";

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
        if (!isFrontend) return;
        if (isTranslationForced) return;

        const nextValue = !isTranslationEnabled;
        accessibilityDispatch({
            type: "SET_ENABLE_TRANSLATIONS",
            payload: nextValue,
        });

        if (nextValue && !accessibilityContext?.selectedLanguage) {
            accessibilityDispatch({
                type: "SET_SELECTED_LANGUAGE",
                payload: accessibilityContext?.siteLanguage || "en",
            });
        }

        if (!nextValue) {
            setOpenLanguageDropdown(false);
        }
    };

    const handleLanguageChange = (languageCode) => {
        if (!isFrontend) return;
        accessibilityDispatch({
            type: "SET_SELECTED_LANGUAGE",
            payload: languageCode,
        });
    };

    return (
        <div
            className={`wap-panel-customization__header${attributes.flipContent ? ' wap-panel-customization__header--flipped' : ''}`}
            style={styleVars}
        >
            <span
                className="wap-panel-customization__header-title"
            >
                {attributes.text || 'Accessibility Menu (CTRL+U)'}
            </span>
            <div className="wap-panel-customization__header-actions">
                {isFrontend && (
                    <>
                        <button
                            type="button"
                            className={`wap-panel-customization__header-action-btn ${isTranslationEnabled ? "is-active" : ""}`}
                            onClick={handleToggleTranslation}
                            disabled={isTranslationForced}
                            title={isTranslationEnabled ? __("Disable translation", "website-accessibility") : __("Enable translation", "website-accessibility")}
                        >
                            <EyeInvisibleOutlined />
                        </button>

                        {isTranslationEnabled && (
                            <TranslationLanguageDropdown
                                open={openLanguageDropdown}
                                onOpenChange={setOpenLanguageDropdown}
                                value={selectedLanguage}
                                onChange={handleLanguageChange}
                                trigger={
                                    <button
                                        type="button"
                                        className="wap-panel-customization__header-action-btn wap-panel-customization__header-action-btn--language"
                                        title={__("Choose translation language", "website-accessibility")}
                                    >
                                        <TranslationOutlined />
                                        <span className="wap-panel-customization__header-action-language">
                                            {getLanguageLabel(selectedLanguage)}
                                        </span>
                                        <GlobalOutlined />
                                    </button>
                                }
                            />
                        )}
                    </>
                )}

                {attributes.showClose !== false && (
                    <span className="wap-panel-customization__header-close" onClick={() => setIsOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </span>
                )}
            </div>
        </div>
    );
};

export default PanelHeader;
