import { useCallback, useEffect, useState } from "react";
import apiFetch from "@wordpress/api-fetch";
import { __ } from "@wordpress/i18n";
import { useQuery } from "@tanstack/react-query";
import SettingsItem from "../components/settings-item";
import StatementSetting from "../components/statement-setting";
import { getAdminExtensions } from "../../utils/admin-extensions";
import { queryClient, REST_PATHS, restQuery, restQueryKey, invalidateRestPrefix } from "../data/queries";

const EMPTY_SETTINGS = {};

const Settings = () => {
    const { WapPageSkeleton, WapMessage, WapCard, WapSpace, WapTypography, WapButton } = window?.wapComponents;
    const { Title, Text } = WapTypography;
    const extensionSections = getAdminExtensions().settingsSections;
    const [saving, setSaving] = useState(false);
    const [resettingStats, setResettingStats] = useState(false);

    const API_NAMESPACE = REST_PATHS.settings;
    // Kept across screens; the first answer comes with the page.
    const settingsQuery = useQuery(restQuery(API_NAMESPACE, { staleTime: 5 * 60 * 1000 }));
    const settings = settingsQuery.data?.data || EMPTY_SETTINGS;
    const loading = settingsQuery.isPending;

    // Same contract as before for add-on sections: a value or an updater function.
    const setSettings = useCallback((next) => {
        queryClient.setQueryData(restQueryKey(REST_PATHS.settings), (previous) => {
            const current = previous?.data || {};
            return { ...(previous || { success: true }), data: typeof next === "function" ? next(current) : next };
        });
    }, []);

    const settingsError = settingsQuery.error;
    useEffect(() => {
        if (settingsError) {
            console.error("Failed to load settings:", settingsError);
            WapMessage.error(__("Failed to load settings.", "website-accessibility"));
        }
    }, [settingsError, WapMessage]);
    const clearUsageStatisticsTimestamp = () => {
        const { removeCookie = null } = window?.wapHelpers || {};
        if (typeof removeCookie === "function") {
            removeCookie("websac_daily_timestamp");
            removeCookie("one_accessibility_daily_timestamp");
            return;
        }

        if (typeof document !== "undefined") {
            document.cookie = "websac_daily_timestamp=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
            document.cookie = "one_accessibility_daily_timestamp=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
        }
    };

    // Fetch all settings from the server again (add-on sections call this).
    const fetchSettings = () => settingsQuery.refetch();

    // Update a single setting
    const updateSetting = async (key, value) => {
        setSaving(true);
        try {
            const res = await apiFetch({
                path: API_NAMESPACE,
                method: "POST",
                data: { [key]: value },
            });
            // The server answers with the stored (sanitized) settings.
            setSettings((prev) => (res?.data && typeof res.data === "object" ? res.data : { ...prev, [key]: value }));
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
                path: "/websac/v1/usage-statistics",
                method: "DELETE",
            });
            clearUsageStatisticsTimestamp();
            // Every cached range is out of date now.
            invalidateRestPrefix("/websac/v1/usage-statistics");

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

    if (loading) {
        return (
            <div className="wap-settings">
                <WapPageSkeleton rows={4} />
            </div>
        );
    }

    return (
        <div className="wap-settings">
            {/* General Statement Section */}
            <StatementSetting />

            {/* Sections contributed by add-ons (e.g. translation, accessibility checker). */}
            {extensionSections.map((Section, index) => (
                <Section
                    key={index}
                    settings={settings}
                    saving={saving}
                    updateSetting={updateSetting}
                    setSettings={setSettings}
                    refreshSettings={fetchSettings}
                />
            ))}

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
