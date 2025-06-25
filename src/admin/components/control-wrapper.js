import { Typography, Flex, Tooltip } from "antd";

const ControlWrapper = ({ children, label, required, tooltip, noLabel = false }) => {
    return (
        <div className="wap-control-wrapper">
            <Flex align="baseline" gap={2}>
                {!noLabel && <Typography.Title level={5}>
                    {label}
                </Typography.Title>}
                {required && <Typography.Text type="danger">*</Typography.Text>}
            </Flex>
            {tooltip && <Tooltip title={tooltip}></Tooltip>}
            {children}
        </div>
    );
};

export default ControlWrapper;