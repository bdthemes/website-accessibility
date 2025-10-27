import { Row } from "antd"

const WapRow = ({ children, ...rest }) => {
    return (
        <Row {...rest}>
            {children}
        </Row>
    )
}

export default WapRow;