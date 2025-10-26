import { useState, useEffect } from "@wordpress/element";
import { Card, Typography, Row, Col, Select, Skeleton, Empty, Flex, Badge } from "antd";
import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";

const { Meta } = Card;
const { Title } = Typography;
const { Option } = Select;

const UsageStatistics = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("daily");
    const { features } = window?.wapHelpers || {};

    // Fetch dynamic stats based on filter
    const fetchStats = async (range) => {
        setLoading(true);
        try {
            const res = await apiFetch({
                path: `/one-accessibility/v1/usage-statistics?range=${range}`,
            });
            if (res?.data) {
                let response = [];
                features && features.forEach((feature) => {
                    response.push({
                        title: feature.label,
                        value: res.data[feature.key],
                        icon: feature?.icon,
                        isDummy: feature?.isDummy || false
                    })
                });
                setStats(response);
            }
        } catch (err) {
            console.error("Failed to fetch statistics:", err);
            setStats([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats(filter);
    }, [filter]);


    return (
        <div style={{ marginTop: 40 }} className="wap-admin-pages">
            <Card
                className="wap-statistics-card"
                title={
                    <Flex justify="space-between" align="center">
                        <Title level={4} style={{ margin: 0 }}>
                            {__("Widget Usage Statistics", "website-accessibility")}
                        </Title>

                        <Select
                            value={filter}
                            onChange={(value) => setFilter(value)}
                            style={{ width: 160 }}
                        >
                            <Option value="daily">{__("Today", "website-accessibility")}</Option>
                            <Option value="7days">{__("Last 7 Days", "website-accessibility")}</Option>
                            <Option value="30days">{__("Last 30 Days", "website-accessibility")}</Option>
                            <Option value="all">{__("All Time", "website-accessibility")}</Option>
                        </Select>
                    </Flex>
                }
            >
                {loading ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                        <Skeleton />
                    </div>
                ) : stats?.length === 0 ? (
                    <Empty
                        description={__("No statistics available yet.", "website-accessibility")}
                        style={{ padding: "40px 0" }}
                    />
                ) : (
                    <Row gutter={[16, 16]}>
                        {stats && stats?.map((stat, index) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={index}>
                                <Card
                                    className="wap-statistics-card-item"
                                    cover={
                                        <Title level={4} className="stat-value" style={{ textAlign: "center", margin: 0 }}>
                                            {stat.value}
                                        </Title>
                                    }
                                >
                                    {
                                        stat.isDummy && (
                                            <Badge color="gold" count={__("PRO", "website-accessibility")} className="wap-statistics-card-dummy" />
                                        )
                                    }
                                    <Meta
                                        avatar={stat.icon}
                                        title={stat.title}
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Card>
        </div>
    );
};

export default UsageStatistics;
