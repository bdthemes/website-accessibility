
const SettingsItem = ({ title, description, checked, onChange, disabled = false }) => {
    const { WapCard, WapSpace, WapSwitch, WapTypography } = window?.wapComponents;
    const { Title, Text } = WapTypography;
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

                <WapSwitch checked={checked} onChange={onChange} disabled={disabled} />
            </WapSpace>
        </WapCard>
    );
};

export default SettingsItem;
