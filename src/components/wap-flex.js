import { Flex } from "antd";

const WapFlex = (props) => {
    return (
        <Flex {...props}>
            {props.children}
        </Flex>
    );
};

export default WapFlex;