
const ControlWrapper = ({ children, label, required, tooltip, noLabel = false, description = '', inline = false }) => {
    const { WapFlex, WapTypography, WapTooltip } = window?.wapComponents;
    return (
        <div className={`wap-control-wrapper${inline ? ' wap-control-wrapper--inline' : ''}`}>
            <WapFlex
                align={inline ? "center" : "baseline"}
                justify={inline ? "space-between" : undefined}
                gap={2}
                className="wap-control-wrapper__head"
            >
                <WapFlex align={inline ? "center" : "baseline"} gap={2}>
                    {!noLabel && <WapTypography.Title level={5}>
                        {label}
                    </WapTypography.Title>}
                    {required && <WapTypography.Text type="danger">*</WapTypography.Text>}
                </WapFlex>
                {inline && <div className="wap-control-wrapper__inline-content">{children}</div>}
            </WapFlex>
            {tooltip && <WapTooltip title={tooltip}></WapTooltip>}
            {!inline && children}
            {description && <WapTypography.Text type="secondary">{description}</WapTypography.Text>}
        </div>
    );
};

export default ControlWrapper;
