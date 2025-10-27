import { useEffect, useState } from "react";
import apiFetch from "@wordpress/api-fetch";
import { Card, Typography, Spin, message } from "antd";
import { __ } from "@wordpress/i18n";
import SettingsItem from "../components/settings-item";
import StatementSetting from "../components/statement-setting";
import WapCard from "../../components/wap-card";

const { Title } = Typography;

const Settings = () => {
    const { isProActive } = window?.websacPro || {};
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const API_NAMESPACE = "/sigmally/v1/settings";

    // Fetch all settings from REST API
    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await apiFetch({ path: API_NAMESPACE });
            setSettings(res?.data || {});
        } catch (error) {
            console.error("Failed to load settings:", error);
            message.error(__("Failed to load settings.", "website-accessibility"));
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
            message.success({
                content: __("Settings saved successfully.", "website-accessibility"),
                style: { marginBlockStart: 20 },
            });
        } catch (error) {
            console.error("Failed to save setting:", error);
            message.error({
                content: __("Failed to save settings.", "website-accessibility"),
                style: { marginBlockStart: 20 },
            });
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);


    if (loading) {
        return (
            <div className="wap-settings-loading">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="wap-settings">
            <WapCard className="wap-settings-card wap-header-card">
                <div className="wap-settings-card-content">
                    <Title level={2} className="wap-header-card-title">
                        {__("One Accessibility Settings", "website-accessibility")}
                    </Title>
                </div>
            </WapCard>

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
                </>
            )}

            <SettingsItem
                title={__("Track Usage Statistics", "website-accessibility")}
                description={__("Enable tracking to monitor how the accessibility widgets are being used.", "website-accessibility")}
                checked={!!settings.show_usage_statistics}
                loading={saving}
                onChange={(checked) => updateSetting("show_usage_statistics", checked)}
            />

        </div>
    );
};

export default Settings;
