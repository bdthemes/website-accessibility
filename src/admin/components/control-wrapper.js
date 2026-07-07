const ControlWrapper = ({ children, label, required, tooltip, noLabel = false, description = '', inline = false, className = '' }) => {
    const { WapFlex, WapTypography, WapTooltip } = window?.wapComponents;
    const normalizedLabel = typeof label === "string" ? label.trim() : "";

    return (
        <div
            className={`wap-control-wrapper${inline ? ' wap-control-wrapper--inline' : ''}${className ? ` ${className}` : ''}`}
            data-search-control-label={normalizedLabel}
        >
            <WapFlex
                gap={6}
                className="wap-control-wrapper__head"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                }}
            >
                <WapFlex align={inline ? "center" : "baseline"} gap={2}>
                    {!noLabel && <WapTypography.Title level={5} data-search-control-label={normalizedLabel}>
                        {label}
                    </WapTypography.Title>}
                    {required && <WapTypography.Text type="danger">*</WapTypography.Text>}
                </WapFlex>
                {inline && <div className="wap-control-wrapper__inline-content" 
                style={{
                    margin: 'unset !important',
                }}
                >{children}</div>}
            </WapFlex>
            {tooltip && <WapTooltip title={tooltip}></WapTooltip>}
            {!inline && children}
            {description && (
                <WapTypography.Text type="secondary" className="wap-control-wrapper__description">
                    {description}
                </WapTypography.Text>
            )}
        </div>
    );
};

export default ControlWrapper;
