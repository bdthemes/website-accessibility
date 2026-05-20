
const SettingsItem = ({ title, description, checked, onChange, disabled = false, dataTour = null }) => {
    const { WapCard, WapSpace, WapSwitch, WapTypography } = window?.wapComponents;
    const { Title, Text } = WapTypography;
    return (
        <WapCard className="wap-settings-row" {...(dataTour ? { 'data-tour': dataTour } : {})}>
            <WapSpace
                align="center"
                style={{
                    width: "100%",
                    justifyContent: "space-between",
                }}
            >
                <WapSpace direction="vertical" size={0}>
                    <Title level={5} style={{ margin: 0 }}>
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
