import { Card, Button, Row, Col, Typography, Space, Progress } from 'antd';
import { __ } from "@wordpress/i18n";
import { useHistory } from "../router";
import { useSelect } from '@wordpress/data';
import { STORE_NAME } from '../store';
import { useEffect, useState } from '@wordpress/element';

const { Title, Text } = Typography;
import Disclaimer from '../components/disclaimer';
import UsageStatistics from '../components/usageStatistics';

const Dashboard = () => {
    const history = useHistory();
    const [statsData, setStatsData] = useState({ average_percent: 0 });
    const [loading, setLoading] = useState(true);

    const navigateTo = (path) => {
        history.push({ page: path });
    };

    // Fetch stats from REST API
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await wp.apiFetch({
                    path: '/sigmally/v1/preference?stats=true',
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

    const stats = [
        {
            title: __('Active Presets', 'website-accessibility'),
            value: activePresetsCount,
            description: __('Presets help you quickly apply accessibility settings across your website.', 'website-accessibility'),
            icon: <span className="dashicons dashicons-universal-access" />,
            action: (
                <Button size="small" onClick={() => navigateTo('website-accessibility-presets')}>
                    <Space>
                        <span className="dashicons dashicons-visibility" />
                        {__('View All', 'website-accessibility')}
                    </Space>
                </Button>
            ),
        },
        {
            title: __('Custom Profiles', 'website-accessibility'),
            value: profilesCount,
            description: __('Create profiles for different user needs and preferences.', 'website-accessibility'),
            icon: <span className="dashicons dashicons-admin-users" />,
            action: (
                <Button size="small" onClick={() => navigateTo('website-accessibilityfiles')}>
                    <Space>
                        <span className="dashicons dashicons-visibility" />
                        {__('View All', 'website-accessibility')}
                    </Space>
                </Button>
            ),
        },
        {
            title: __('Saved Preferences', 'website-accessibility'),
            value: `${statsData.users_with_data || 0}/${statsData.total_users || 0}`,
            description: __('Users who have saved their accessibility preferences.', 'website-accessibility'),
            icon: <span className="dashicons dashicons-visibility" />,
            action: (
                <Progress
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
            <Disclaimer />
            <div className="wap-dashboard">
                <Card
                    className="wap-welcome-card wap-header-card"
                >
                    <div className="wap-welcome-card-content">
                        <Title level={2} className='wap-header-card-title'>
                            {__('Welcome to One Accessibility', 'website-accessibility')}
                        </Title>
                        <Text className='wap-header-card-description'>
                            {__('Make your website accessible to everyone with our comprehensive accessibility tools.', 'website-accessibility')}
                        </Text>
                    </div>
                    <div>
                        <Button
                            type="primary"
                            size="large"
                            onClick={() => navigateTo('website-accessibility-presets-create')}
                        >
                            <Space>
                                <span className="dashicons dashicons-plus-alt2" />
                                {__('Create New Preset', 'website-accessibility')}
                            </Space>
                        </Button>
                    </div>
                </Card>

                <Row gutter={[24, 24]} align="stretch" className="statistics-grid wap-statistics-grid">
                    {stats.map((stat, idx) => (
                        <Col xs={24} md={8} key={stat.title} className="stat-card">
                            <Card>
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
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Title level={4} className='wap-section-title'>
                    {__('Quick Actions', 'website-accessibility')}
                </Title>
                <Row gutter={[16, 16]} justify="center">
                    <Col xs={24} md={8}>
                        <div className="quick-action-btn-wrapper">
                            <Button block size="large" onClick={() => navigateTo('website-accessibility-presets')}>
                                <Space>
                                    <span className="dashicons dashicons-universal-access" />
                                    <span>{__('Manage Presets', 'website-accessibility')}</span>
                                </Space>
                            </Button>
                        </div>
                    </Col>
                    <Col xs={24} md={8}>
                        <div className="quick-action-btn-wrapper">
                            <Button block size="large" onClick={() => navigateTo('website-accessibilityfiles')}>
                                <Space>
                                    <span className="dashicons dashicons-admin-users" />
                                    <span>{__('Manage Profiles', 'website-accessibility')}</span>
                                </Space>
                            </Button>
                        </div>
                    </Col>
                    <Col xs={24} md={8}>
                        <div className="quick-action-btn-wrapper">
                            <Button block size="large" onClick={() => navigateTo('website-accessibility-settings')}>
                                <Space>
                                    <span className="dashicons dashicons-admin-generic" />
                                    <span>{__('Accessibility Settings', 'website-accessibility')}</span>
                                </Space>
                            </Button>
                        </div>
                    </Col>
                </Row>

                <Card 
                    className="usage-statistics-section" 
                    style={{ marginTop: '24px' }}
                    title={
                        <Title level={4} style={{ margin: 0 }}>
                            {__('Widget Usage Statistics', 'website-accessibility')}
                        </Title>
                    }
                >
                    <UsageStatistics />
                </Card>
            </div>
        </>
    );
};

export default Dashboard;
