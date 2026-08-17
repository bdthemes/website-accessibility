import { __ } from "@wordpress/i18n";
import { useHistory } from "../router";
import { useSelect } from '@wordpress/data';
import { STORE_NAME } from '../store';
import { useEffect, useState } from '@wordpress/element';
import { getAdminExtensions } from '../../utils/admin-extensions';

// Inline SVG icons (replace dashicons) — currentColor via CSS
const svgProps = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    width: "16",
    height: "16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
};

// Active Presets — sliders metaphor (stroke icon, matches dashicon replacement)
const IconSliders = () => (
    <span className="wap-dashboard-svg-icon" aria-hidden="true">
        <svg {...svgProps}>
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="2" y1="14" x2="6" y2="14" />
            <line x1="10" y1="8" x2="14" y2="8" />
            <line x1="18" y1="16" x2="22" y2="16" />
        </svg>
    </span>
);

const IconUsers = () => (
    <span className="wap-dashboard-svg-icon" aria-hidden="true">
        <svg {...svgProps}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    </span>
);

const IconEye = () => (
    <span className="wap-dashboard-svg-icon" aria-hidden="true">
        <svg {...svgProps}>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    </span>
);

const IconPlus = () => (
    <span className="wap-dashboard-svg-icon" aria-hidden="true">
        <svg {...svgProps}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    </span>
);

const Dashboard = () => {
    const { WapCard, WapButton, WapRow, WapCol, WapSpace, WapTypography, WapProgress } = window?.wapComponents;
    const { Title, Text } = WapTypography;
    const history = useHistory();
    const [statsData, setStatsData] = useState({ average_percent: 0 });
    const [loading, setLoading] = useState(true);

    const navigateTo = (path) => {
        history.push({ page: path });
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await wp.apiFetch({
                    path: '/websac/v1/preference?stats=true',
                });
                if (response?.success) {
                    setStatsData(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const { activePresetsCount, profilesCount } = useSelect((select) => {
        const { getPresets, getProfiles } = select(STORE_NAME);
        const presets = getPresets();
        const activePresets = presets?.filter(preset => {
            const { content: { raw } } = preset;
            const data = JSON.parse(raw);
            return data?.preset?.active;
        });

        return {
            activePresetsCount: activePresets?.length || 0,
            profilesCount: getProfiles()?.length || 0,
        };
    }, []);

    const viewAllBtn = (path) => (
        <WapButton size="small" onClick={() => navigateTo(path)} className="wap-dashboard-viewall">
            <WapSpace size="small">
                <IconEye />
                {__('View All', 'website-accessibility')}
            </WapSpace>
        </WapButton>
    );

    const stats = [
        {
            cardKey: 'presets',
            title: __('Active Presets', 'website-accessibility'),
            value: activePresetsCount,
            description: __('Presets help you quickly apply accessibility settings across your website.', 'website-accessibility'),
            icon: <IconSliders />,
            action: viewAllBtn('website-accessibility-presets'),
        },
        // The custom-profiles screen is provided by an add-on; the card is only
        // shown when one has registered its profiles store.
        ...(getAdminExtensions().profilesStore
            ? [{
                cardKey: 'profiles',
                title: __('Custom Profiles', 'website-accessibility'),
                value: profilesCount,
                description: __('Create profiles for different user needs and preferences.', 'website-accessibility'),
                icon: <IconUsers />,
                action: viewAllBtn('website-accessibilityfiles'),
            }]
            : []),
        {
            cardKey: 'preferences',
            title: __('Saved Preferences', 'website-accessibility'),
            value: `${statsData.users_with_data || 0}/${statsData.total_users || 0}`,
            description: __('Users who have saved their accessibility preferences.', 'website-accessibility'),
            icon: <IconEye />,
            action: (
                <WapProgress
                    percent={statsData.average_percent || 0}
                    size="small"
                    showInfo={false}
                    status={loading ? 'active' : 'normal'}
                />
            ),
            extra: <Text type="secondary">{loading ? 'Loading...' : `${statsData.average_percent || 0}%`}</Text>,
        },
    ];

    return (
        <>
            <div className="wap-settings wap-dashboard" data-tour="wap-tour-dashboard-home">
                <WapRow gutter={[12, 12]} align="stretch" className="statistics-grid wap-statistics-grid">
                    {stats.map((stat) => (
                        <WapCol xs={24} md={24 / stats.length} key={stat.title} className="stat-card">
                            <WapCard className={`wap-settings-row wap-dashboard-stat-card wap-dashboard-stat-card--${stat.cardKey || 'default'}`} size="small">
                                <div className="stat-icon-wrapper">
                                    {stat.icon}
                                    <div className="stat-content">
                                        <Title className="stat-title" level={4}>{stat.title}</Title>
                                        <Title className="stat-value" level={4}>{stat.value}</Title>
                                    </div>
                                </div>
                                <div className="stat-content-footer">
                                    <Text className="stat-description">{stat.description}</Text>
                                    <div>{stat.action} {stat.extra}</div>
                                </div>
                            </WapCard>
                        </WapCol>
                    ))}
                </WapRow>
            </div>
        </>
    );
};

export default Dashboard;
