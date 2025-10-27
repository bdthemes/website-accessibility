import { Collapse } from "antd"

const WapCollapse = (props) => {
    return (
        <Collapse {...props}>
            {props.children}
        </Collapse>
    )
}

export default WapCollapse;
