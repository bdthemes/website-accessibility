import { Col } from "antd";

const WapCol = ({ children, ...rest }) => {
    return (
        <Col {...rest}>
            {children}
        </Col>
    )
}

export default WapCol;