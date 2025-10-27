import { Drawer } from "antd";

const WapDrawer = (props) => {
    return (
        <Drawer {...props}>
            {props.children}
        </Drawer>
    )
}

export default WapDrawer;