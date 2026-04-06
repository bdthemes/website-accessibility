import { Upload } from "antd";

const WapUpload = ({ children, ...rest }) => {
    return (
        <Upload {...rest}>
            {children}
        </Upload>
    );
};

WapUpload.Dragger = Upload.Dragger;
WapUpload.LIST_IGNORE = Upload.LIST_IGNORE;

export default WapUpload;
