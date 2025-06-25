import { Card, Button, Row, Col, Typography, Space, Progress } from 'antd';
import { __ } from "@wordpress/i18n";
import { useHistory } from "../router";

const { Title, Text } = Typography;
import { useSelect } from '@wordpress/data';
import { STORE_NAME } from '../store';

const Dashboard = () => {
    const history = useHistory();

    const navigateTo = (path) => {
        history.push({
            page: path,
        });
    };

    const { activePresetsCount, profilesCount } = useSelect((select) => {
        const { getPresets, getProfiles } = select(STORE_NAME);
        const presets = getPresets();
        const activePresets = presets?.filter(preset => {
            const { content: { raw } } = preset;
            const data = JSON.parse(raw);
            if (data?.preset?.active) {
                return true;
            }

            return false;
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
            icon: <span className="dashicons dashicons-universal-access"/>,
            action: (
                <Button
                    type="primary" 
                    onClick={() => navigateTo('website-accessibility-presets')}
                >
                    {__('View All', 'website-accessibility')}
                </Button>
            ),
        },
        {
            title: __('Preset Profiles', 'website-accessibility'),
            value: profilesCount,
            description: __('Create profiles for different user needs and preferences.', 'website-accessibility'),
            icon: <span className="dashicons dashicons-admin-users"/>,
            action: (
                <Button 
                    type="primary" 
                    onClick={() => navigateTo('website-accessibilityfiles')}
                >
                    {__('View All', 'website-accessibility')}
                </Button>
            ),
        },
        {
            title: __('Saved Preferences', 'website-accessibility'),
            value: 0,
            description: __('Users who have saved their accessibility preferences.', 'website-accessibility'),
            icon: <span className="dashicons dashicons-visibility"/>,
            action: <Progress percent={0} size="small" showInfo={false} />, 
            extra: <Text type="secondary">0%</Text>,
        },
    ];

    return (
        <div className="wap-dashboard">
            <Card
                className="wap-welcome-card"
            >
                <Title level={2}>
                    {__('Welcome to Website Accessibility Pro', 'website-accessibility')}
                </Title>
                <Text>
                    {__('Make your website accessible to everyone with our comprehensive accessibility tools.', 'website-accessibility')}
                </Text>
                <div>
                    <Button
                        type="primary"
                        size="large"
                        onClick={() => navigateTo('website-accessibility-presets-create')}
                    >
                        {__('Create New Preset', 'website-accessibility')}
                    </Button>
                </div>
            </Card>

            <Row gutter={[24, 24]} align="stretch" className="statistics-grid">
                {stats.map((stat, idx) => (
                    <Col xs={24} md={8} key={stat.title}>
                        <Card>
                            <Space align="center" size="large">
                                {stat.icon}
                                <Title level={5}>{stat.title}</Title>
                            </Space>
                            <div>{stat.value}</div>
                            <div>{stat.action} {stat.extra}</div>
                            <Text>{stat.description}</Text>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Quick Actions */}
            <Card className="quick-actions">
                <Title level={5}>
                    {__('Quick Actions', 'website-accessibility')}
                </Title>
                <Row gutter={[16, 16]} justify="center">
                    <Col xs={24} md={8}>
                        <div className="quick-action-btn-wrapper">
                            <Button block size="large" onClick={() => navigateTo('website-accessibility-presets')}>
                                <Space>
                                    <span className="dashicons dashicons-universal-access"/>
                                    <span>{__('Manage Presets', 'website-accessibility')}</span>
                                </Space>
                            </Button>
                        </div>
                    </Col>
                    <Col xs={24} md={8}>
                        <div className="quick-action-btn-wrapper">
                            <Button block size="large" onClick={() => navigateTo('website-accessibilityfiles')}>
                                <Space>
                                    <span className="dashicons dashicons-admin-users"/>
                                    <span>{__('Manage Profiles', 'website-accessibility')}</span>
                                </Space>
                            </Button>
                        </div>
                    </Col>
                    <Col xs={24} md={8}>
                        <div className="quick-action-btn-wrapper">
                            <Button block size="large" onClick={() => navigateTo('website-accessibility-settings')}>
                                <Space>
                                    <span className="dashicons dashicons-admin-generic"/>
                                    <span>{__('Accessibility Settings', 'website-accessibility')}</span>
                                </Space>
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default Dashboard;
