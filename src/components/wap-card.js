import { Card } from "antd";

const WapCard = (props) => {
    return (
        <Card {...props}>
            {props.children}
        </Card>
    );
};

// expose AntD Card.Meta so callers can use `WapCard.Meta`
WapCard.Meta = Card.Meta;

export default WapCard;