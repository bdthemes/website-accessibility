import { Card, Switch, Typography, Space } from "antd";

const { Title, Text } = Typography;

const SettingsItem = ({ title, description, checked, onChange, disabled = false }) => {
    return (
        <Card
            style={{
                marginBottom: 10,
                borderRadius: 12,
            }}
        >
            <Space
                align="center"
                style={{
                    width: "100%",
                    justifyContent: "space-between",
                }}
            >
                <Space direction="vertical" size={0}>
                    <Title level={4} style={{ margin: 0 }}>
                        {title}
                    </Title>
                    <Text type="secondary">{description}</Text>
                </Space>

                <Switch checked={checked} onChange={onChange} disabled={disabled} />
            </Space>
        </Card>
    );
};

export default SettingsItem;
