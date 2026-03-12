import { useState, useEffect } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";

const UsageStatistics = () => {
    const { WapCard, WapSelect, WapTypography, WapSkeleton, WapEmpty, WapBadge } = window?.wapComponents;
    const { Title } = WapTypography;
    const { Option } = WapSelect;
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("daily");
    const { features } = window?.wapHelpers || {};

    const fetchStats = async (range) => {
        setLoading(true);
        try {
            const res = await apiFetch({
                path: `/one-accessibility/v1/usage-statistics?range=${range}`,
            });
            if (res?.data) {
                const response = [];
                features && features.forEach((feature) => {
                    response.push({
                        title: feature.label,
                        value: res.data[feature.key],
                        icon: feature?.icon,
                        isDummy: feature?.isDummy || false,
                    });
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
        <div style={{ marginTop: 20 }} className=" wap-usage-statistics">
            <WapCard
                className="wap-statistics-card"
                title={
                    <div className="wap-statistics-card__head">
                        <Title level={4} className="wap-statistics-card__head-title">
                            {__("Widget Usage Statistics", "website-accessibility")}
                        </Title>
                        <WapSelect
                            value={filter}
                            onChange={(value) => setFilter(value)}
                            className="wap-statistics-card__filter"
                            popupClassName="wap-statistics-card__filter-dropdown"
                            size="small"
                        >
                            <Option value="daily">{__("Today", "website-accessibility")}</Option>
                            <Option value="7days">{__("Last 7 Days", "website-accessibility")}</Option>
                            <Option value="30days">{__("Last 30 Days", "website-accessibility")}</Option>
                            <Option value="all">{__("All Time", "website-accessibility")}</Option>
                        </WapSelect>
                    </div>
                }
            >
                {loading ? (
                    <div style={{ textAlign: "center", padding: "24px 0" }}>
                        <WapSkeleton />
                    </div>
                ) : stats?.length === 0 ? (
                    <WapEmpty
                        description={__("No statistics available yet.", "website-accessibility")}
                        style={{ padding: "24px 0" }}
                    />
                ) : (
                    <ul className="wap-statistics-list">
                        {stats.map((stat, index) => (
                            <li key={index} className="wap-statistics-list__item">
                                <div className="wap-statistics-list__item-top">
                                    <span className="wap-statistics-list__icon" aria-hidden="true">
                                        {stat.icon}
                                    </span>
                                    <span className="wap-statistics-list__value">{stat.value ?? 0}</span>
                                </div>
                                <span className="wap-statistics-list__name" title={stat.title}>
                                    {stat.title}
                                </span>
                                {stat.isDummy && (
                                    <WapBadge
                                        color="gold"
                                        count={__("PRO", "website-accessibility")}
                                        className="wap-statistics-list__badge"
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </WapCard>
        </div>
    );
};

export default UsageStatistics;
