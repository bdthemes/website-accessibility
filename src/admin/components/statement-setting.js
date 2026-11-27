import { useState, useEffect } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import {
    ReloadOutlined,
    ExclamationCircleOutlined,
    CheckCircleOutlined,
    EditOutlined,
} from "@ant-design/icons";
import { __ } from "@wordpress/i18n";
import { useQuery } from "@tanstack/react-query";
import statementJson from "../../../default-posts/statement.json";
import { queryClient, REST_PATHS, restQuery, restQueryKey } from "../data/queries";

/** Replace the {{site_name}} / {{site_url}} / {{admin_email}} / {{date}} placeholders of the sample statement. */
const fillStatementPlaceholders = (content = "") => {
    const admin = window?.websacAdmin || {};
    const map = {
        "{{site_name}}": admin.siteName || "",
        "{{site_url}}": admin.homeUrl || "/",
        "{{admin_email}}": admin.adminEmail || "",
        "{{date}}": new Date().toLocaleDateString(),
    };
    return String(content || "").replace(/\{\{(site_name|site_url|admin_email|date)\}\}/g, (m) => map[m] ?? "");
};


const StatementSetting = () => {
    const { WapCard, WapSpace, WapButton, WapAlert, WapTooltip, WapTypography } = window?.wapComponents;

    const { Title, Text } = WapTypography;
    const [creating, setCreating] = useState(false);

    // Whether the Accessibility Statement page exists (draft or published). Kept
    // across screens; the first answer comes with the page.
    const pageQuery = useQuery(restQuery(REST_PATHS.statementPage, { staleTime: 5 * 60 * 1000 }));
    const page = Array.isArray(pageQuery.data) && pageQuery.data.length > 0 ? pageQuery.data[0] : null;
    const loading = pageQuery.isPending;
    const setPage = (newPage) => {
        queryClient.setQueryData(restQueryKey(REST_PATHS.statementPage), newPage ? [newPage] : []);
    };

    const pageError = pageQuery.error;
    useEffect(() => {
        if (pageError) {
            console.error("Error checking statement page:", pageError);
        }
    }, [pageError]);

    // Generate new statement page
    const handleGenerate = async () => {
        const { WapMessage } = window?.wapComponents;
        setCreating(true);
        try {
            const newPage = await apiFetch({
                path: "/wp/v2/pages",
                method: "POST",
                data: {
                    title: statementJson?.post_title,
                    slug: statementJson?.post_name,
                    content: fillStatementPlaceholders(statementJson?.post_content),
                    status: statementJson?.post_status,
                },
            });
            setPage(newPage);
            WapMessage.success({
                content: "Accessibility Statement page created successfully.",
                style: { marginTop: 20 },
            });
        } catch (err) {
            console.error("Error creating statement page:", err);
            WapMessage.error({
                content: "Failed to create Accessibility Statement page.",
                style: { marginTop: 20 },
            });
        } finally {
            setCreating(false);
        }
    };

    return (
        <WapCard className="wap-settings-row">
            <WapSpace
                align="start"
                style={{
                    width: "100%",
                    justifyContent: "space-between",
                }}
            >
                {/* Left side: Title, description, warning */}
                <WapSpace direction="vertical" size={6} style={{ flex: 1 }}>
                    <Title level={4} style={{ margin: 0 }}>
                        {__("Statement Page", "website-accessibility")}
                    </Title>
                    <Text type="secondary">
                        {__(
                            "This page communicates your accessibility commitment to visitors.",
                            "website-accessibility"
                        )}
                    </Text>

                    {!loading && !page && (
                        <WapAlert
                            message={__(
                                "No Accessibility Statement page found. Click the button to generate one.",
                                "website-accessibility"
                            )}
                            type="warning"
                            showIcon
                            icon={<ExclamationCircleOutlined style={{ fontSize: 18 }} />}
                            style={{
                                marginTop: 10,
                                borderRadius: 8,
                            }}
                        />
                    )}
                </WapSpace>

                {!page ? (
                    <WapTooltip
                        title={__("Click to generate a statement page", "website-accessibility")}
                    >
                        <WapButton
                            type="primary"
                            shape="circle"
                            icon={<ReloadOutlined spin={creating || loading} />}
                            onClick={handleGenerate}
                            style={{
                                height: 32,
                            }}
                        />
                    </WapTooltip>
                ) : (
                    <WapSpace>
                        <WapTooltip
                            title={__("Preview statement page", "website-accessibility")}
                        >
                            <WapButton
                                type="primary"
                                shape="circle"
                                icon={<CheckCircleOutlined />}
                                href={page?.link}
                                target="_blank"
                                size="large"
                            />
                        </WapTooltip>
                        <WapTooltip
                            title={__("Edit statement page", "website-accessibility")}
                        >
                            <WapButton
                                type="default"
                                shape="circle"
                                icon={<EditOutlined />}
                                href={`/wp-admin/post.php?post=${page?.id}&action=edit`}
                                target="_blank"
                                size="large"
                            />
                        </WapTooltip>
                    </WapSpace>
                )}
            </WapSpace>
        </WapCard>
    );
};

export default StatementSetting;
