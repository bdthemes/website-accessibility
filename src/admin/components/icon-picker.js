import { Select } from "antd";
import { __ } from "@wordpress/i18n";
import * as icons from "../assets/icons";
import Icon from "./icon";

const IconPicker = (props) => {
    const options = Object.entries(icons).map(([key, value]) => ({
        label: (
            <div className="wap-icon-picker-item">
                <Icon name={key} />
                <span>{key}</span>
            </div>
        ),
        value: key
    }));

    return <Select className="wap-icon-picker" options={options} {...props} />
};

export default IconPicker;