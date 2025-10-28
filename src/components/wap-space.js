import { Space } from "antd"

const WapSpace = ({ ...props }) => {
    return (
        <Space {...props}>
            {props.children}
        </Space>
    );
}

export default WapSpace;