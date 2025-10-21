import { useState, useEffect } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import { Card, Button, Typography, Space, Tooltip, message, Alert } from "antd";
import {
    ReloadOutlined,
    ExclamationCircleOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import { __ } from "@wordpress/i18n";
import { addQueryArgs } from "@wordpress/url";

const { Title, Text } = Typography;

import statementJson from "../../../default-posts/statement.json";

const StatementSetting = () => {
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    // Check if the Accessibility Statement page exists
    useEffect(() => {
        const fetchPage = async () => {
            setLoading(true);
            try {
                const url = addQueryArgs("/wp/v2/pages", {
                    slug: "one-accessibility-statement-page",
                    status: "any",          // get draft & published
                    _fields: "id,title,link,status,slug",
                    per_page: 1,            // correct param instead of limit
                });

                const response = await apiFetch({
                    path: url,
                });

                if (response?.length > 0) {
                    setPage(response[0]);
                }
            } catch (err) {
                console.error("Error checking statement page:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
    }, []);

    // Generate new statement page
    const handleGenerate = async () => {
        setCreating(true);
        try {
            const newPage = await apiFetch({
                path: "/wp/v2/pages",
                method: "POST",
                data: {
                    title: statementJson?.post_title,
                    slug: statementJson?.post_name,
                    content: statementJson?.post_content,
                    status: statementJson?.post_status,
                },
            });
            setPage(newPage);
            message.success({
                content: "Accessibility Statement page created successfully.",
                style: { marginTop: 20 },
            });
        } catch (err) {
            console.error("Error creating statement page:", err);
            message.error({
                content: "Failed to create Accessibility Statement page.",
                style: { marginTop: 20 },
            });
        } finally {
            setCreating(false);
        }
    };

    return (
        <Card
            style={{
                marginTop: 20,
                borderRadius: 16,
            }}
        >
            <Space
                align="start"
                style={{
                    width: "100%",
                    justifyContent: "space-between",
                }}
            >
                {/* Left side: Title, description, warning */}
                <Space direction="vertical" size={6} style={{ flex: 1 }}>
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
                        <Alert
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
                </Space>

                {
                    !page ? (
                        <Tooltip
                            title={__("Click to generate a statement page", "website-accessibility")}
                        >
                            <Button
                                type="primary"
                                shape="circle"
                                icon={<ReloadOutlined spin={creating || loading} />}
                                onClick={handleGenerate}
                            />
                        </Tooltip>
                    ) : (
                        <Tooltip
                            title={__("Hurray! We have a statement page!", "website-accessibility")}
                        >
                            <Button
                                type="primary"
                                shape="circle"
                                icon={<CheckCircleOutlined />}
                                href={page?.link}
                                target="_blank"
                                size="large"
                            />
                        </Tooltip>
                    )
                }
            </Space>
        </Card>
    );
};

export default StatementSetting;
