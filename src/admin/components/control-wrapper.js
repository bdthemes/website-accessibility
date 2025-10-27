import { Typography, Tooltip } from "antd";
import WapFlex from "../../components/wap-flex";

const ControlWrapper = ({ children, label, required, tooltip, noLabel = false, description = '' }) => {
    return (
        <div className="wap-control-wrapper">
            <WapFlex align="baseline" gap={2}>
                {!noLabel && <Typography.Title level={5}>
                    {label}
                </Typography.Title>}
                {required && <Typography.Text type="danger">*</Typography.Text>}
            </WapFlex>
            {tooltip && <Tooltip title={tooltip}></Tooltip>}
            {children}
            {description && <Typography.Text type="secondary">{description}</Typography.Text>}
        </div>
    );
};

export default ControlWrapper;