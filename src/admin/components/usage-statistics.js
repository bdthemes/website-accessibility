import { useState, useEffect, useMemo } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";
const HIGHLIGHT_COUNT = 4;

const UsageStatistics = () => {
    const { WapCard, WapSelect, WapTypography, WapSkeleton, WapEmpty, WapRow, WapCol } = window?.wapComponents;
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
                path: `/websac/v1/usage-statistics?range=${range}`,
            });
            if (res?.data) {
                const response = [];
                features &&
                    features.forEach((feature) => {
                        response.push({
                            key: feature.key,
                            title: feature.label,
                            value: res.data[feature.key],
                            previousValue: res?.previous_data?.[feature.key] ?? 0,
                            icon: feature?.icon,
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

    const { topHighlights, listRest } = useMemo(() => {
        const withNum = stats.map((s) => ({
            ...s,
            num: Number(s.value) || 0,
            prevNum: Number(s.previousValue) || 0,
        }));
        const sorted = [...withNum].sort((a, b) => b.num - a.num);
        return {
            topHighlights: sorted.slice(0, HIGHLIGHT_COUNT),
            listRest: sorted.slice(HIGHLIGHT_COUNT),
        };
    }, [stats]);

    const getChangeMeta = (num, prevNum) => {
        const diff = num - prevNum;
        const percentChange = prevNum > 0
            ? Math.round((Math.abs(diff) / prevNum) * 100)
            : (num > 0 ? 100 : 0);

        if (diff > 0) {
            return { label: `+${percentChange}% ${__("increase", "website-accessibility")}`, tone: "up" };
        }
        if (diff < 0) {
            return { label: `-${percentChange}% ${__("decrease", "website-accessibility")}`, tone: "down" };
        }
        return { label: __("No change", "website-accessibility"), tone: "flat" };
    };

    return (
        <div className="wap-usage-statistics">
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
                            classNames={{ popup: { root: "wap-statistics-card__filter-dropdown" } }}
                            size="small"
                        >
                            <Option value="daily">{__("Today", "website-accessibility")}</Option>
                            <Option value="last7days">{__("Last 7 Days", "website-accessibility")}</Option>
                            <Option value="last30days">{__("Last 30 Days", "website-accessibility")}</Option>
                            <Option value="totals">{__("All Time", "website-accessibility")}</Option>
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
                    <>
                        <WapRow gutter={[12, 12]} className="wap-statistics-highlight">
                            {topHighlights.map((stat) => {
                                const change = getChangeMeta(stat.num, stat.prevNum);
                                const mod = stat.key || "default";
                                return (
																	<WapCol
																		xs={24}
																		sm={12}
																		lg={6}
																		key={stat.key || mod}
																	>
																		<div
																			className={`wap-statistics-highlight__card wap-statistics-highlight__card--${mod}`}
																		>
																			<div className="wap-statistics-highlight__top">
																				<div
																					className="wap-statistics-highlight__icon-wrap"
																					aria-hidden="true"
																				>
																					<span className="wap-statistics-highlight__icon">
																						{stat.icon}
																					</span>
																				</div>
																				<div
																					className="wap-statistics-highlight__stat-pill"
																					title={change.label}
																				>
																					<span className="wap-statistics-highlight__stat-num">
																						{stat.num}
																					</span>
																					<span className={`wap-statistics-highlight__stat-pct wap-statistics-highlight__stat-pct--${change.tone}`}>
																						{change.label}
																					</span>
																				</div>
																			</div>
																			<div className="wap-statistics-highlight__bottom">
																				<div className="wap-statistics-highlight__label-row">
																					<span
																						className="wap-statistics-highlight__label"
																						title={stat.title}
																					>
																						{stat.title}
																					</span>
																				</div>
																			</div>
																		</div>
																	</WapCol>
																);
                            })}
                        </WapRow>

                        {listRest.length > 0 && (
                            <div className="wap-statistics-list-wrap">
                                <Title level={5} className="wap-statistics-list-wrap__title">
                                    {__("Other features", "website-accessibility")}
                                </Title>
                                <ul className="wap-statistics-list wap-statistics-list--remainder">
                                    {listRest.map((stat, index) => (
                                        <li
                                            key={stat.key || index}
                                            className={`wap-statistics-list__item wap-statistics-list__item--${stat.key || "default"}`}
                                        >
                                            <div className="wap-statistics-list__left">
                                                <div className="wap-statistics-list__icon-wrap" aria-hidden="true">
                                                    <span className="wap-statistics-list__icon">{stat.icon}</span>
                                                </div>
                                                <span className="wap-statistics-list__name" title={stat.title}>
                                                    {stat.title}
                                                </span>
                                            </div>
                                            <div className="wap-statistics-list__right">
                                                <span className="wap-statistics-list__value">
                                                    {stat.value ?? 0}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </WapCard>
        </div>
    );
};

export default UsageStatistics;
