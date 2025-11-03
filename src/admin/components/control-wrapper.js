
const ControlWrapper = ({ children, label, required, tooltip, noLabel = false, description = '' }) => {
    const { WapFlex, WapTypography, WapTooltip } = window?.wapComponents;
    return (
        <div className="wap-control-wrapper">
            <WapFlex align="baseline" gap={2}>
                {!noLabel && <WapTypography.Title level={5}>
                    {label}
                </WapTypography.Title>}
                {required && <WapTypography.Text type="danger">*</WapTypography.Text>}
            </WapFlex>
            {tooltip && <WapTooltip title={tooltip}></WapTooltip>}
            {children}
            {description && <WapTypography.Text type="secondary">{description}</WapTypography.Text>}
        </div>
    );
};

export default ControlWrapper;