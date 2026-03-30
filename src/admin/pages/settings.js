import { useEffect, useState } from "react";
import apiFetch from "@wordpress/api-fetch";
import { __ } from "@wordpress/i18n";
import SettingsItem from "../components/settings-item";
import StatementSetting from "../components/statement-setting";


const Settings = () => {
    const { WapSpin, WapMessage, WapCard, WapSpace, WapTypography, WapInputNumber, WapSelect, WapButton } = window?.wapComponents;
    const { Title, Text } = WapTypography;
    const { isProActive } = window?.websacPro || {};
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [resettingStats, setResettingStats] = useState(false);

    const API_NAMESPACE = "/sigmally/v1/settings";

    // Fetch all settings from REST API
    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await apiFetch({ path: API_NAMESPACE });
            setSettings(res?.data || {});
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

            {/* Example Setting: Translation Consent */}
            {isProActive && (
                <>
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
                    <SettingsItem
                        title={__("Always on Translation", "website-accessibility")}
                        description={__(
                            "This will remove the translation toggle button and ensure that the frontend content is always translated according to the selected language.",
                            "website-accessibility"
                        )}
                        checked={!!settings.always_on_translations}
                        loading={saving}
                        onChange={(checked) => updateSetting("always_on_translations", checked)}
                    />
                    <SettingsItem
                        title={__("Enable Accessibility Checker", "website-accessibility")}
                        description={__(
                            "Show a Accessibility Checker button in the frontend for admin",
                            "website-accessibility"
                        )}
                        checked={!!settings.enable_accessibility_checker}
                        loading={saving}
                        onChange={(checked) => updateSetting("enable_accessibility_checker", checked)}
                    />
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
                <WapCard className="wap-settings-row">
                    <WapSpace
                        align="center"
                        style={{
                            width: "100%",
                            justifyContent: "space-between",
                        }}
                    >
                        <WapSpace direction="vertical" size={0}>
                            <Title level={5} style={{ margin: 0 }}>
                                {__("Statistics Save Frequency", "website-accessibility")}
                            </Title>
                            <Text type="secondary">
                                {__("Choose how often usage statistics are saved.", "website-accessibility")}
                            </Text>
                        </WapSpace>

                        <WapSpace>
                            <WapInputNumber
                                min={1}
                                size="large"
                                value={Number(settings?.usage_statistics_interval_value) || 12}
                                onChange={(value) => updateSetting("usage_statistics_interval_value", Math.max(1, Number(value) || 1))}
                                style={{ width: 120 }}
                            />
                            <WapSelect
                                size="large"
                                value={settings?.usage_statistics_interval_unit || "hour"}
                                onChange={(value) => updateSetting("usage_statistics_interval_unit", value)}
                                style={{ width: 120 }}
                            >
                                <WapSelect.Option value="minute">{__("Minute(s)", "website-accessibility")}</WapSelect.Option>
                                <WapSelect.Option value="hour">{__("Hour(s)", "website-accessibility")}</WapSelect.Option>
                            </WapSelect>
                        </WapSpace>
                    </WapSpace>
                </WapCard>
            )}
            {settings?.show_usage_statistics && (
                <WapCard className="wap-settings-row">
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
