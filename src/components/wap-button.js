import { Button } from "antd";

const WapButton = ({ children, ...rest }) => {
    return (
        <Button {...rest}>
            {children}
        </Button>
    )
}

export default WapButton