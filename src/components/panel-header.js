import { useEffect, useMemo, useState } from "@wordpress/element";
import { ReloadOutlined } from "@ant-design/icons";
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
    const [editorSelectedLanguage, setEditorSelectedLanguage] = useState(siteLanguage);
    const [headerElement, setHeaderElement] = useState(null);
    const [consentRefreshKey, setConsentRefreshKey] = useState(0);

    // Find the header item from value.items
    const headerItem = value?.items?.find(item => item.slug === 'header') || {};
    const attributes = headerItem.attributes || {};
    const panelWidth = value?.wrapper?.width || 420;
    const isProActive = window?.websacPro?.isProActive || false;
    const { TranslationLanguageDropdown, WapTooltip } = window?.wapComponents || {};
    const {
        getCookie = (() => null),
        removeCookie = (() => null),
    } = window?.wapHelpers || {};
    const [messageApi, contextHolder] = (window?.wapComponents?.WapMessage || {}).useMessage?.() || [];
    const { settings } = window?.websiteAccessibility || {};
    const isFrontend = !isEditorPreview && !!accessibilityContext && !!accessibilityDispatch;
    const isForceTranslateSiteLanguage = !!settings?.force_translate_site_language;
    const showTranslator = attributes?.showTranslator !== false;
    const translateConsent = useMemo(() => (
        isFrontend ? getCookie("wapGoogleTranslateConsent") : null
    ), [getCookie, isFrontend, consentRefreshKey]);
    const isConsentDeclined = isFrontend && translateConsent === "false";
    const isConsentAccepted = isFrontend && translateConsent === "true";
    const hasTranslateConsent = isFrontend && !!translateConsent;
    const effectiveSiteLanguage = isFrontend
        ? (accessibilityContext?.siteLanguage || siteLanguage)
        : siteLanguage;
    const selectedLanguage = isFrontend
        ? (accessibilityContext?.selectedLanguage || effectiveSiteLanguage)
        : editorSelectedLanguage;
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

    const clearTranslationCacheState = () => {
        if (typeof document === "undefined") return;

        const expireCookie = (name, path = "/") => {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path};`;
            const host = window.location.hostname;
            if (host) {
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=.${host};`;
            }
        };

        // Known translate cookies.
        expireCookie("googtrans", "/");
        expireCookie("googtrans", "/auto");

        try {
            const keys = Object.keys(localStorage || {});
            keys.forEach((key) => {
                if (!key) return;
                const normalized = key.toLowerCase();
                if (normalized.includes("goog") || normalized.includes("translate")) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            // ignore storage-access errors
        }
    };

    const handleLanguageChange = (languageCode) => {
        if (!isFrontend) {
            setEditorSelectedLanguage(languageCode);
            return;
        }

        clearTranslationCacheState();

        // Apply immediately so first-time translation is not blocked by async toggles.
        accessibilityDispatch({
            type: "SET_SELECTED_LANGUAGE",
            payload: languageCode,
        });

        accessibilityDispatch({
            type: "SET_ENABLE_TRANSLATIONS",
            payload: !!languageCode && (
                languageCode !== (accessibilityContext?.siteLanguage || siteLanguage)
                || isForceTranslateSiteLanguage
            ),
        });
    };

    const handleResetAll = () => {
        if (!isFrontend) return;

        // Ensure language dropdown closes immediately after reset.
        setOpenLanguageDropdown(false);

        // 2) Reset all accessibility states (previous footer behavior)
        accessibilityDispatch({ type: "RESET_ACCESSIBILITY" });

        // Hide translation behavior until consent is accepted again.
        accessibilityDispatch({
            type: "SET_ENABLE_TRANSLATIONS",
            payload: false,
        });

        if (settings?.force_translate_site_language) {
            const fallbackLanguage = accessibilityContext?.siteLanguage || null;
            accessibilityDispatch({
                type: "SET_SELECTED_LANGUAGE",
                payload: fallbackLanguage,
            });
            accessibilityDispatch({
                type: "SET_ENABLE_TRANSLATIONS",
                payload: !!fallbackLanguage,
            });
        }

        // 1) Clear translation consent (previous header behavior)
        removeCookie("wapGoogleTranslateConsent");
        setConsentRefreshKey((prev) => prev + 1);

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
            <svg className="wap-panel-customization__header-icon" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24.0557 37.04C24.4857 40.37 25.3357 43.4902 26.5557 46.1602H21.5557C22.7757 43.4902 23.6257 40.37 24.0557 37.04ZM31.3262 2C32.066 2.00014 32.7256 2.46026 32.9756 3.16016L46.0459 43.8096L46.0361 43.7803C46.4458 44.9202 45.5956 46.1299 44.3857 46.1299H31.9658C31.9458 46.0799 31.9255 46.0402 31.8955 45.9902C30.0355 42.8902 28.8257 38.45 28.5957 33.79C28.5157 32.02 28.5561 30.2698 28.7461 28.5898C31.026 28.2898 33.1961 27.7602 35.166 27.0303C36.4158 26.5703 37.0456 25.1903 36.5859 23.9404C36.126 22.6906 34.746 22.0598 33.4961 22.5195C30.6961 23.5595 27.3657 24.1104 23.8857 24.1104C20.4058 24.1103 17.156 23.5696 14.376 22.5596C13.126 22.1096 11.7462 22.7501 11.2861 24C10.8362 25.2499 11.4758 26.6297 12.7256 27.0898C14.7556 27.8298 17.016 28.3504 19.376 28.6504C19.5559 30.3201 19.6056 32.0499 19.5156 33.8096C19.2856 38.4695 18.0758 42.9098 16.2158 46.0098L16.1455 46.1504H3.75586C2.5559 46.1504 1.70579 44.97 2.0957 43.8301L14.5361 3.19043C14.7761 2.48043 15.4463 2 16.1963 2H31.3262ZM27.7559 18.3301C27.5559 16.3001 25.7458 14.8196 23.7158 15.0195C21.6859 15.2195 20.2065 17.0297 20.4062 19.0596C20.6063 21.0896 22.4163 22.5701 24.4463 22.3701C26.476 22.1699 27.9558 20.3599 27.7559 18.3301Z" fill="#ffffff" />
            </svg>
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

                {isProActive && showTranslator && !isConsentDeclined && (!isFrontend || isConsentAccepted) && TranslationLanguageDropdown && (
                    <>
                        {
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
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                aria-hidden="true"
                                            >
                                                <path d="M6.50197 6.42188H6.20103L5.63867 9.23438H7.06433L6.50197 6.42188Z" fill="currentColor" />
                                                <path d="M17.877 12.0469C18.1806 12.8625 18.5844 13.5226 19.0313 14.0844C19.4782 13.5226 19.9289 12.8624 20.2325 12.0469H17.877Z" fill="currentColor" />
                                                <path d="M21.8906 4.26562H13.1585L14.9793 18.8756C15.0115 19.4731 14.8481 20.0357 14.4581 20.4762L11.3748 24H21.8906C23.0537 24 23.9999 23.0538 23.9999 21.8906V6.42188C23.9999 5.25872 23.0537 4.26562 21.8906 4.26562ZM21.8906 12.0469H21.7028C21.3027 13.3305 20.6682 14.3348 20.0089 15.1267C20.5254 15.5989 21.0777 15.9862 21.6269 16.4201C21.9297 16.6625 21.9791 17.1047 21.7361 17.4082C21.4941 17.7113 21.0502 17.7604 20.748 17.5174C20.1513 17.0464 19.5912 16.6522 19.0312 16.1383C18.4711 16.6522 17.9579 17.0464 17.3613 17.5174C17.0591 17.7604 16.6151 17.7113 16.3732 17.4082C16.1301 17.1047 16.1795 16.6625 16.4823 16.4201C17.0315 15.9862 17.5369 15.5989 18.0535 15.1267C17.3941 14.3349 16.8065 13.3305 16.4065 12.0469H16.2187C15.83 12.0469 15.5156 11.7324 15.5156 11.3438C15.5156 10.9551 15.83 10.6406 16.2187 10.6406H18.3281V9.9375C18.3281 9.54886 18.6425 9.23438 19.0312 9.23438C19.4198 9.23438 19.7343 9.54886 19.7343 9.9375V10.6406H21.8906C22.2792 10.6406 22.5937 10.9551 22.5937 11.3438C22.5937 11.7324 22.2792 12.0469 21.8906 12.0469Z" fill="currentColor" />
                                                <path d="M11.4452 1.84777C11.314 0.794437 10.4138 0 9.35231 0H2.10938C0.946219 0 0 0.946219 0 2.10938V17.6719C0 18.835 0.946219 19.7812 2.10938 19.7812C6.31266 19.7812 9.33642 19.7812 13.1977 19.7812C13.4028 19.5468 13.5748 19.4 13.582 19.0939C13.5838 19.0172 11.4547 1.92389 11.4452 1.84777ZM8.62238 13.4394C8.24953 13.5161 7.87186 13.2741 7.79498 12.888L7.34559 10.6406H5.35758L4.90819 12.888C4.83267 13.2684 4.46597 13.5183 4.0808 13.4394C3.70041 13.3632 3.45319 12.9931 3.52941 12.612L4.93561 5.58075C5.00152 5.25253 5.28994 5.01562 5.625 5.01562H7.07812C7.41319 5.01562 7.70161 5.25253 7.76752 5.58075L9.17377 12.612C9.24998 12.9931 9.00281 13.3632 8.62238 13.4394Z" fill="currentColor" />
                                                <path d="M8.21533 21.1875L8.33599 22.1522C8.41643 22.7983 8.84571 23.4571 9.55183 23.7861C10.8844 22.3192 10.0782 23.2066 11.9124 21.1875H8.21533Z" fill="currentColor" />
                                            </svg>
                                        </button>
                                    </WapTooltip>
                                }
                            />
                        }
                    </>
                )}

                <span className="wap-panel-customization__header-close-separator"></span>
                <span className="wap-panel-customization__header-close" onClick={() => setIsOpen(false)}>
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
                            fill="white"
                        />
                    </svg>

                </span>
            </div>
        </div>
    );
};

export default PanelHeader;
