import { useEffect, useState } from "react";
import apiFetch from "@wordpress/api-fetch";
import { __ } from "@wordpress/i18n";
import SettingsItem from "../components/settings-item";
import StatementSetting from "../components/statement-setting";
import { useLicense } from "../context/LicenseContext";


const Settings = () => {
    const { WapSpin, WapMessage, WapCard, WapSpace, WapTypography, WapButton, WapInput, WapSelect, WapSwitch } = window?.wapComponents;
    const { Title, Text } = WapTypography;
    const { isProActive } = useLicense();
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [resettingStats, setResettingStats] = useState(false);
    const [aiProvider, setAiProvider] = useState("openai");
    const [openAiApiKey, setOpenAiApiKey] = useState("");
    const [geminiApiKey, setGeminiApiKey] = useState("");
    const [testingAiKey, setTestingAiKey] = useState(false);
    const [testingAlertEmail, setTestingAlertEmail] = useState(false);

    const API_NAMESPACE = "/sigmally/v1/settings";
    const clearUsageStatisticsTimestamp = () => {
        const { removeCookie = null } = window?.wapHelpers || {};
        if (typeof removeCookie === "function") {
            removeCookie("one_accessibility_daily_timestamp");
            return;
        }

        if (typeof document !== "undefined") {
            document.cookie = "one_accessibility_daily_timestamp=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
        }
    };

    // Fetch all settings from REST API
    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await apiFetch({ path: API_NAMESPACE });
            setSettings(res?.data || {});
            setAiProvider(res?.data?.ai_provider || "openai");
            setOpenAiApiKey(res?.data?.openai_api_key || "");
            setGeminiApiKey(res?.data?.gemini_api_key || "");
        } catch (error) {
            console.error("Failed to load settings:", error);
            WapMessage.error(__("Failed to load settings.", "website-accessibility"));
        } finally {
            setLoading(false);
        }
    };

    // Update a single setting
    const updateSetting = async (key, value) => {
        setSaving(true);
        try {
            const res = await apiFetch({
                path: API_NAMESPACE,
                method: "POST",
                data: { [key]: value },
            });
            setSettings((prev) => ({ ...prev, [key]: value }));
            WapMessage.success({
                content: __("Settings saved successfully.", "website-accessibility"),
                style: { marginBlockStart: 20 },
            });
        } catch (error) {
            console.error("Failed to save setting:", error);
            WapMessage.error({
                content: __("Failed to save settings.", "website-accessibility"),
                style: { marginBlockStart: 20 },
            });
        } finally {
            setSaving(false);
        }
    };

    const resetUsageStatistics = async () => {
        const confirmed = window.confirm(__("Are you sure you want to clear all usage statistics?", "website-accessibility"));
        if (!confirmed) return;

        setResettingStats(true);
        try {
            await apiFetch({
                path: "/one-accessibility/v1/usage-statistics",
                method: "DELETE",
            });
            clearUsageStatisticsTimestamp();

            WapMessage.success({
                content: __("Usage statistics cleared successfully.", "website-accessibility"),
                style: { marginBlockStart: 20 },
            });
        } catch (error) {
            console.error("Failed to clear usage statistics:", error);
            WapMessage.error({
                content: __("Failed to clear usage statistics.", "website-accessibility"),
                style: { marginBlockStart: 20 },
            });
        } finally {
            setResettingStats(false);
        }
    };

    const saveOpenAiApiKey = async () => {
        setSaving(true);
        try {
            await apiFetch({
                path: API_NAMESPACE,
                method: "POST",
                data: {
                    ai_provider: aiProvider,
                    openai_api_key: openAiApiKey,
                    gemini_api_key: geminiApiKey,
                },
            });
            setSettings((prev) => ({
                ...prev,
                ai_provider: aiProvider,
                openai_api_key: openAiApiKey,
                gemini_api_key: geminiApiKey,
            }));
            WapMessage.success({
                content: __("Settings saved successfully.", "website-accessibility"),
                style: { marginBlockStart: 20 },
            });
        } catch (error) {
            WapMessage.error({
                content: __("Failed to save settings.", "website-accessibility"),
                style: { marginBlockStart: 20 },
            });
        } finally {
            setSaving(false);
        }
    };

    const testOpenAiApiKey = async () => {
        setTestingAiKey(true);
        try {
            const isGemini = aiProvider === "gemini";
            const keyToTest = ((isGemini ? geminiApiKey : openAiApiKey) || "").trim();
            if (!keyToTest) {
                throw new Error("missing_key");
            }

            await apiFetch({
                path: "/one-accessibility/v1/checker-ai-test",
                method: "POST",
                data: {
                    provider: aiProvider,
                    api_key: keyToTest,
                },
            });

            WapMessage.success({
                content: __("API key is working.", "website-accessibility"),
                style: { marginBlockStart: 20 },
            });
        } catch (error) {
            WapMessage.error({
                content: __("API key test failed. Please verify and try again.", "website-accessibility"),
                style: { marginBlockStart: 20 },
            });
        } finally {
            setTestingAiKey(false);
        }
    };

    const handleOpenChecker = () => {
        const homeUrl = window?.websacAdmin?.homeUrl || "/";
        const targetUrl = new URL(homeUrl, window.location.origin);
        targetUrl.searchParams.set("checker_open", "true");
        window.open(targetUrl.toString(), "_blank", "noopener,noreferrer");
    };

    const sendTestAlertEmail = async () => {
        setTestingAlertEmail(true);
        try {
            const res = await apiFetch({
                path: "/one-accessibility/v1/compliance-summary/test-email",
                method: "POST",
            });
            if (res?.success) {
                WapMessage.success(res?.message || __("Test email sent.", "website-accessibility"));
            } else {
                WapMessage.error(res?.message || __("Failed to send test email.", "website-accessibility"));
            }
        } catch (error) {
            WapMessage.error(
                error?.message || __("Failed to send test email. Check SMTP settings.", "website-accessibility")
            );
        } finally {
            setTestingAlertEmail(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);


    if (loading) {
        return (
            <div className="wap-settings-loading">
                <WapSpin size="large" />
            </div>
        );
    }

    return (
        <div className="wap-settings">
            {/* General Statement Section */}
            <StatementSetting />

            {isProActive && (
                <>
                    <div data-tour="wap-tour-settings-translation">
                        <SettingsItem
                            title={__("Show Consent for Translation", "website-accessibility")}
                            description={__(
                                "Show a consent message to users before translating content.",
                                "website-accessibility"
                            )}
                            checked={!!settings.show_translations_consent}
                            loading={saving}
                            onChange={(checked) => updateSetting("show_translations_consent", checked)}
                        />
                        <SettingsItem
                            title={__("Force Translate Site Language", "website-accessibility")}
                            description={__(
                                "Automatically translate your website's original language. This will override the default site language translation with auto-generated translations.",
                                "website-accessibility"
                            )}
                            checked={!!settings.force_translate_site_language}
                            loading={saving}
                            onChange={(checked) => updateSetting("force_translate_site_language", checked)}
                        />
                    </div>
                    <SettingsItem
                        title={__("Enable Accessibility Checker", "website-accessibility")}
                        description={__(
                            "Show a Accessibility Checker button in the frontend for admin",
                            "website-accessibility"
                        )}
                        checked={!!settings.enable_accessibility_checker}
                        loading={saving}
                        onChange={(checked) => updateSetting("enable_accessibility_checker", checked)}
                        dataTour="wap-tour-settings-checker"
                    />
                    {!!settings.enable_accessibility_checker && (
                        <>
                        <WapCard className="wap-settings-row wap-checker-ai-settings" data-tour="wap-tour-settings-checker-ai">
                            <div className="wap-checker-ai-settings__intro">
                                <div className="wap-checker-ai-settings__intro-head">
                                    <Title level={5} style={{ margin: 0 }}>
                                        {__("Checker AI Provider", "website-accessibility")}
                                    </Title>
                                    <WapButton type="default" onClick={handleOpenChecker}>
                                        {__("Open Checker", "website-accessibility")}
                                    </WapButton>
                                </div>
                                <Text type="secondary">
                                    {__(
                                        "Used by 'Fix With AI' inside Accessibility Checker Pro. Keys are stored server-side.",
                                        "website-accessibility"
                                    )}
                                </Text>
                            </div>

                            <div className="wap-checker-ai-settings__row">
                                <div className="wap-checker-ai-settings__row-text">
                                    <Title level={5} style={{ margin: 0 }}>
                                        {__("AI Provider", "website-accessibility")}
                                    </Title>
                                    <Text type="secondary">
                                        {__(
                                            "Choose which API powers automated fixes in the checker.",
                                            "website-accessibility"
                                        )}
                                    </Text>
                                </div>
                                <div className="wap-checker-ai-settings__control">
                                    <WapSelect
                                        className="wap-checker-ai-settings__select"
                                        value={aiProvider}
                                        onChange={(value) => setAiProvider(value || "openai")}
                                        popupMatchSelectWidth={false}
                                    >
                                        <WapSelect.Option value="openai">{__("OpenAI", "website-accessibility")}</WapSelect.Option>
                                        <WapSelect.Option value="gemini">{__("Google Gemini", "website-accessibility")}</WapSelect.Option>
                                    </WapSelect>
                                </div>
                            </div>

                            <div className="wap-checker-ai-settings__row">
                                <div className="wap-checker-ai-settings__row-text">
                                    <Title level={5} style={{ margin: 0 }}>
                                        {__("API key", "website-accessibility")}
                                    </Title>
                                    <Text type="secondary">
                                        {aiProvider === "openai"
                                            ? __(
                                                  "Secret key from OpenAI (starts with sk-). Leave blank to keep the saved key.",
                                                  "website-accessibility"
                                              )
                                            : __(
                                                  "API key from Google AI Studio (AIza…). Leave blank to keep the saved key.",
                                                  "website-accessibility"
                                              )}
                                    </Text>
                                </div>
                                <div className="wap-checker-ai-settings__control">
                                    {aiProvider === "openai" ? (
                                        <div className="wap-checker-ai-settings__api-key-field">
                                            <WapInput
                                                className="wap-checker-ai-settings__input"
                                                type="password"
                                                value={openAiApiKey}
                                                onChange={(e) => setOpenAiApiKey(e?.target?.value || "")}
                                                placeholder={
                                                    settings?.openai_api_key
                                                        ? __("Key saved. Enter new key to replace.", "website-accessibility")
                                                        : __("sk-...", "website-accessibility")
                                                }
                                            />
                                            <a
                                                className="wap-checker-ai-settings__key-link"
                                                href="https://platform.openai.com/api-keys"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {__("Get or create an OpenAI API key", "website-accessibility")}
                                                <span className="wap-checker-ai-settings__key-link-icon" aria-hidden="true">
                                                    ↗
                                                </span>
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="wap-checker-ai-settings__api-key-field">
                                            <WapInput
                                                className="wap-checker-ai-settings__input"
                                                type="password"
                                                value={geminiApiKey}
                                                onChange={(e) => setGeminiApiKey(e?.target?.value || "")}
                                                placeholder={
                                                    settings?.gemini_api_key
                                                        ? __("Gemini key saved. Enter new key to replace.", "website-accessibility")
                                                        : __("AIza...", "website-accessibility")
                                                }
                                            />
                                            <a
                                                className="wap-checker-ai-settings__key-link"
                                                href="https://aistudio.google.com/apikey"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {__("Get or create a Google AI Studio (Gemini) API key", "website-accessibility")}
                                                <span className="wap-checker-ai-settings__key-link-icon" aria-hidden="true">
                                                    ↗
                                                </span>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="wap-checker-ai-settings__row wap-checker-ai-settings__row--actions">
                                <div className="wap-checker-ai-settings__row-text">
                                    <Title level={5} style={{ margin: 0 }}>
                                        {__("Save & test", "website-accessibility")}
                                    </Title>
                                    <Text type="secondary">
                                        {__(
                                            "Save your provider and key, then test the connection.",
                                            "website-accessibility"
                                        )}
                                    </Text>
                                </div>
                                <div className="wap-checker-ai-settings__actions">
                                    <WapSpace size="small" wrap align="center">
                                        <WapButton type="primary" onClick={saveOpenAiApiKey} loading={saving}>
                                            {__("Save AI Settings", "website-accessibility")}
                                        </WapButton>
                                        <WapButton onClick={testOpenAiApiKey} loading={testingAiKey}>
                                            {__("Test API Key", "website-accessibility")}
                                        </WapButton>
                                        {((aiProvider === "openai" && !!settings?.openai_api_key) ||
                                            (aiProvider === "gemini" && !!settings?.gemini_api_key)) && (
                                            <Text type="success">{__("Configured", "website-accessibility")}</Text>
                                        )}
                                    </WapSpace>
                                </div>
                            </div>
                        </WapCard>

                        <WapCard className="wap-settings-row wap-checker-ai-settings wap-compliance-settings" data-tour="wap-tour-settings-compliance">
                            <div className="wap-checker-ai-settings__intro">
                                <div className="wap-checker-ai-settings__intro-head">
                                    <Title level={5} style={{ margin: 0 }}>
                                        {__("Compliance monitoring", "website-accessibility")}
                                    </Title>
                                </div>
                                <Text type="secondary">
                                    {__(
                                        "Get notified when Critical issues rise, and optionally re-scan pages when you visit them.",
                                        "website-accessibility"
                                    )}
                                </Text>
                            </div>
                            <div className="wap-checker-ai-settings__row">
                                <div className="wap-checker-ai-settings__row-text">
                                    <Title level={5} style={{ margin: 0 }}>
                                        {__("Email when Critical rises", "website-accessibility")}
                                    </Title>
                                    <Text type="secondary">
                                        {__(
                                            "Sends only when Critical count goes UP after a scan.",
                                            "website-accessibility"
                                        )}
                                    </Text>
                                    <button
                                        type="button"
                                        className="wap-compliance-settings__test-link"
                                        onClick={sendTestAlertEmail}
                                        disabled={testingAlertEmail}
                                    >
                                        {testingAlertEmail
                                            ? __("Sending…", "website-accessibility")
                                            : __("Send test email", "website-accessibility")}
                                    </button>
                                </div>
                                <div className="wap-checker-ai-settings__control">
                                    <WapSwitch
                                        checked={settings.compliance_email_alerts !== false}
                                        onChange={(checked) => updateSetting("compliance_email_alerts", checked)}
                                    />
                                </div>
                            </div>
                            <div className="wap-checker-ai-settings__row">
                                <div className="wap-checker-ai-settings__row-text">
                                    <Title level={5} style={{ margin: 0 }}>
                                        {__("Auto-scan when visiting pages", "website-accessibility")}
                                    </Title>
                                    <Text type="secondary">
                                        {__(
                                            "For admins: open Checker and scan again if this page was last scanned longer ago than this.",
                                            "website-accessibility"
                                        )}
                                    </Text>
                                </div>
                                <div className="wap-checker-ai-settings__control">
                                    <WapSelect
                                        className="wap-checker-ai-settings__select wap-compliance-settings__select"
                                        size="middle"
                                        value={String(settings.compliance_auto_scan_days ?? 0)}
                                        onChange={(value) => updateSetting("compliance_auto_scan_days", Number(value) || 0)}
                                        options={[
                                            { value: "0", label: __("Off", "website-accessibility") },
                                            { value: "7", label: __("Every 7 days", "website-accessibility") },
                                            { value: "14", label: __("Every 14 days", "website-accessibility") },
                                            { value: "30", label: __("Every 30 days", "website-accessibility") },
                                        ]}
                                    />
                                </div>
                            </div>
                        </WapCard>
                        </>
                    )}
                </>
            )}

            <SettingsItem
                title={__("Track Usage Statistics", "website-accessibility")}
                description={__("Enable tracking to monitor how the accessibility widgets are being used.", "website-accessibility")}
                checked={!!settings.show_usage_statistics}
                loading={saving}
                onChange={(checked) => updateSetting("show_usage_statistics", checked)}
            />
            {settings?.show_usage_statistics && (
                <WapCard className="wap-settings-row wap-settings-row--actions">
                    <WapSpace
                        align="center"
                        style={{
                            width: "100%",
                            justifyContent: "space-between",
                        }}
                    >
                        <WapSpace direction="vertical" size={0}>
                            <Title level={5} style={{ margin: 0 }}>
                                {__("Clear Usage Statistics", "website-accessibility")}
                            </Title>
                            <Text type="secondary">
                                {__("Remove all saved usage statistics data.", "website-accessibility")}
                            </Text>
                        </WapSpace>

                        <WapButton danger onClick={resetUsageStatistics} loading={resettingStats}>
                            {__("Clear Statistics", "website-accessibility")}
                        </WapButton>
                    </WapSpace>
                </WapCard>
            )}

        </div>
    );
};

export default Settings;
