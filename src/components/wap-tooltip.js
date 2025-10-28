import { Tooltip } from "antd"

const WapTooltip = ({ ...props }) => {
    return (
        <Tooltip {...props}>
            {props.children}
        </Tooltip>
    );
}

export default WapTooltip;