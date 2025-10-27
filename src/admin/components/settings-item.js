import { Switch, Typography, Space } from "antd";
import WapCard from "../../components/wap-card";


const { Title, Text } = Typography;

const SettingsItem = ({ title, description, checked, onChange, disabled = false }) => {
    return (
        <WapCard
            style={{
                marginTop: 20,
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
        </WapCard>
    );
};

export default SettingsItem;
