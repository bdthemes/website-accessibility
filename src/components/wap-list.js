import { List } from "antd"

const WapList = ({ ...props }) => {
    return (
        <List {...props} />
    )
}

// expose AntD static subcomponents so callers can use `WapList.Item` and `WapList.Item.Meta`
WapList.Item = List.Item;

export default WapList;