import { Avatar } from "antd";

const WapAvatar = ({...props}) => {
    return (
        <Avatar {...props} >
            {props.children}
        </Avatar>
    );
};

export default WapAvatar;