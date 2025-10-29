import { Card } from "antd";

const WapCard = (props) => {
    return (
        <Card {...props}>
            {props.children}
        </Card>
    );
};

export default WapCard;