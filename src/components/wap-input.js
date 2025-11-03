import { Input } from "antd"

const WapInput = ({...props}) => {
    return (
        <Input {...props} />
    )
}

WapInput.TextArea = Input.TextArea;

export default WapInput;
