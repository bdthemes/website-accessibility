import { Card } from 'antd';
import { __ } from "@wordpress/i18n";
import Title from 'antd/es/typography/Title';
import UsageStatistics from './usageStatistics';

const UsageStatisticsSection = () => (
    <div style={{ marginTop: 40 }} className="wap-admin-pages">
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
);

export default UsageStatisticsSection;
