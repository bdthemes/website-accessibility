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
                    slug: "sigmally-accessibility-statement-page",
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
                    title: "Accessibility Statement",
                    slug: "sigmally-accessibility-statement-page",
                    content: `
                        <p>At<a href="https://bdthemes.com"><strong>bdthemes.com</strong></a>, we are committed to ensuring that our website is accessible and usable by everyone, including individuals with disabilities. We believe in creating a digital environment that is inclusive, user-friendly, and compliant with global accessibility standards.</p>

                        <h2>Our Commitment</h2>
                        <p>Our website aims to align with the Web Content Accessibility Guidelines (WCAG) 2.1, and supports compliance with the Americans with Disabilities Act (ADA) and the European Accessibility Act (EAA). These standards define how to make web content accessible for people with visual, hearing, motor, and cognitive impairments.</p>
                        <p>Accessibility is an ongoing process, and we are dedicated to reviewing, improving, and enhancing our site to better serve all visitors.</p>

                        <h2>Accessibility Features</h2>
                        <p>To support accessibility, our website includes a wide range of helpful tools and adjustments powered by <strong>Sigmally Website Accessibility by BdThemes</strong>, such as:</p>
                        <ul>
                            <li>Adjustable contrast &amp; smart contrast</li>
                            <li>Highlight links for better visibility</li>
                            <li>Bigger text, text spacing, line height &amp; alignment controls</li>
                            <li>Ability to pause animations and hide images</li>
                            <li>Custom cursor options for improved navigation</li>
                            <li>Tooltips for additional context</li>
                            <li>Saturation adjustments for visual comfort</li>
                            <li>Dictionary &amp; 100+ language translations</li>
                            <li>Dyslexia-friendly mode for easier reading</li>
                            <li>Screen reader support for assistive technologies</li>
                        </ul>

                        <h2>Assistive Technology &amp; Browser Compatibility</h2>
                        <p>Our site is tested for compatibility with leading browsers such as Chrome, Firefox, Safari, Opera, and Edge</p>

                        <h2>Feedback &amp; Contact</h2>
                        <p>We welcome feedback and suggestions to further improve accessibility. If you encounter any accessibility barriers while using our site, please contact us:</p>
                        <p><a href="https://bdthemes.com/support/">https://bdthemes.com/support/</a> | email: <a href="mailto:support@bdthemes.com">support@bdthemes.com</a></p>
                        <p>We aim to respond within 1–3 business days and can provide alternative support if required.</p>

                        <h2>Important Note</h2>
                        <p>Despite our best efforts to enable anyone to adjust the website to their needs, there may still be pages or sections that are not fully accessible, are in the process of becoming accessible, or lack an adequate technological solution to make them accessible. Still, we are continually improving our accessibility, adding, updating, and enhancing our features, while adopting new technologies.</p>
                        <p>All of this is part of our commitment to achieving the optimal level of accessibility in line with technological advancements.</p>
                        <p><strong>Last updated:</strong> October 14, 2025</p>
                    `,
                    status: "draft",
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
