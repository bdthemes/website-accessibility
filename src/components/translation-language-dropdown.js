import { useMemo, useState } from "@wordpress/element";
import { SearchOutlined, CheckOutlined } from "@ant-design/icons";
import { __ } from "@wordpress/i18n";

const LANGUAGES = [
    { code: "en", name: "English (USA)", flag: "🇺🇸" },
    { code: "en-GB", name: "English (UK)", flag: "🇬🇧" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "pt", name: "Português", flag: "🇵🇹" },
    { code: "it", name: "Italiano", flag: "🇮🇹" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "zh-CN", name: "简体中文", flag: "🇨🇳" },
    { code: "zh-TW", name: "繁體中文", flag: "🇹🇼" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "bn", name: "বাংলা", flag: "🇧🇩" },
    { code: "tr", name: "Türkçe", flag: "🇹🇷" },
    { code: "nl", name: "Nederlands", flag: "🇳🇱" },
    { code: "pl", name: "Polski", flag: "🇵🇱" },
    { code: "sv", name: "Svenska", flag: "🇸🇪" },
    { code: "cs", name: "Čeština", flag: "🇨🇿" },
];

const TranslationLanguageDropdown = ({
    trigger,
    open = false,
    onOpenChange = () => {},
    value = null,
    onChange = () => {},
}) => {
    const { WapDropdown, WapInput } = window?.wapComponents;
    const [search, setSearch] = useState("");

    const filteredLanguages = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return LANGUAGES;

        return LANGUAGES.filter((language) => {
            return (
                language.name.toLowerCase().includes(keyword) ||
                language.code.toLowerCase().includes(keyword)
            );
        });
    }, [search]);

    return (
        <WapDropdown
            trigger={["click"]}
            open={open}
            onOpenChange={onOpenChange}
            dropdownRender={() => (
                <div className="wap-translation-dropdown" onClick={(e) => e.stopPropagation()}>
                    <div className="wap-translation-dropdown__head">
                        <span className="wap-translation-dropdown__title">
                            {__("Choose Translation Language", "website-accessibility")}
                        </span>
                    </div>
                    <WapInput
                        className="wap-translation-dropdown__search"
                        placeholder={__("Search language", "website-accessibility")}
                        value={search}
                        onChange={(event) => setSearch(event?.target?.value || "")}
                        prefix={<SearchOutlined />}
                        allowClear
                    />
                    <div className="wap-translation-dropdown__list">
                        {filteredLanguages.map((language) => {
                            const isActive = value === language.code;
                            return (
                                <button
                                    key={language.code}
                                    className={`wap-translation-dropdown__item ${isActive ? "wap-translation-dropdown__item--active" : ""}`}
                                    onClick={() => {
                                        onChange(language.code);
                                        onOpenChange(false);
                                    }}
                                >
                                    <span className="wap-translation-dropdown__item-flag">{language.flag}</span>
                                    <span className="wap-translation-dropdown__item-label">{language.name}</span>
                                    {isActive && <CheckOutlined className="wap-translation-dropdown__item-check" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        >
            {trigger}
        </WapDropdown>
    );
};

export const getLanguageLabel = (code) => {
    if (!code) return __("Language", "website-accessibility");
    return LANGUAGES.find((item) => item.code === code)?.name || code;
};

export default TranslationLanguageDropdown;
