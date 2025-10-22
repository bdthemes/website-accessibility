import { Card, Typography } from 'antd';
import { __ } from "@wordpress/i18n";
import UsageStatistics from './usage-statistics';

const { Title } = Typography;

const UsageStatisticsSection = () => {

    return (
        <div style={{marginTop: 40}} className="wap-admin-pages">
            <Card
                title={
                    <Title level={4} >
                        {__('Widget Usage Statistics', 'website-accessibility')}
                    </Title>
                }
            >
                <UsageStatistics />
            </Card>
        </div>
    );
};

export default UsageStatisticsSection;
