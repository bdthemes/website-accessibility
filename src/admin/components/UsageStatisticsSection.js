import { Card } from 'antd';
import { __ } from "@wordpress/i18n";
import Title from 'antd/es/typography/Title';
import clsx from 'clsx';
import UsageStatistics from './usageStatistics';

const UsageStatisticsSection = () => {

    return (
        <div style={{marginTop: 40}} className={clsx('wap-admin-pages')}>
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
