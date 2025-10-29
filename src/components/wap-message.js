import { message } from "antd";

const WapMessage = ({...props}) => {
    return (
        message({
            ...props
        })
    );
};

export default WapMessage;