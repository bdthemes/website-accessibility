

import { Card, Typography, Row, Col, Statistic } from 'antd';
import { __ } from "@wordpress/i18n";
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text } = Typography;

const UsageStatistics = () => {
    const stats = [
        {
            title: 'Bigger Text',
            value: 85,
            change: 12,
            isIncrease: true,
            precision: 0
        },
        {
            title: 'Contrast +',
            value: 78,
            change: 8,
            isIncrease: true,
            precision: 0
        },
        {
            title: 'Text Spacing',
            value: 65,
            change: 15,
            isIncrease: true,
            precision: 0
        }
    ];

    return (
        <Row gutter={[16, 16]}>
            {stats.map((stat, index) => (
                <Col xs={24} md={8} key={index}>
                    <Card 
                        variant="borderless"
                        style={{ 
                            borderRadius: '8px',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
                            height: '100%',
                            background: "#F0F2F5"
                        }}
                    >
                        <Statistic
                            title={stat.title}
                            value={stat.value}
                            precision={stat.precision}
                            valueStyle={{ 
                                color: stat.isIncrease ? '#3f8600' : '#cf1322',
                                fontSize: '24px'
                            }}
                            prefix={
                                stat.isIncrease ? 
                                    <ArrowUpOutlined style={{ fontSize: '14px' }} /> : 
                                    <ArrowDownOutlined style={{ fontSize: '14px' }} />
                            }
                            suffix="%"
                        />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {stat.isIncrease ? '+' : ''}{stat.change}% from last week
                        </Text>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default UsageStatistics;
