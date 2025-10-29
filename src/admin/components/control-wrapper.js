const { WapFlex, WapTypography, WapTooltip } = window?.wapComponents;

const ControlWrapper = ({ children, label, required, tooltip, noLabel = false, description = '' }) => {
    return (
        <div className="wap-control-wrapper">
            <WapFlex align="baseline" gap={2}>
                {!noLabel && <WapTypography level={5}>
                    {label}
                </WapTypography>}
                {required && <WapTypography type="danger">*</WapTypography>}
            </WapFlex>
            {tooltip && <WapTooltip title={tooltip}></WapTooltip>}
            {children}
            {description && <WapTypography type="secondary">{description}</WapTypography>}
        </div>
    );
};

export default ControlWrapper;