import { Switch, Typography, Space } from "antd";
import WapCard from "../../components/wap-card";
import WapSpace from "../../components/wap-space";


const { Title, Text } = Typography;

const SettingsItem = ({ title, description, checked, onChange, disabled = false }) => {
    return (
        <WapCard
            style={{
                marginTop: 20,
                borderRadius: 12,
            }}
        >
            <WapSpace
                align="center"
                style={{
                    width: "100%",
                    justifyContent: "space-between",
                }}
            >
                <WapSpace direction="vertical" size={0}>
                    <Title level={4} style={{ margin: 0 }}>
                        {title}
                    </Title>
                    <Text type="secondary">{description}</Text>
                </WapSpace>

                <Switch checked={checked} onChange={onChange} disabled={disabled} />
            </WapSpace>
        </WapCard>
    );
};

export default SettingsItem;
