import { __ } from "@wordpress/i18n";
import * as icons from "../../assets/icons";
import Icon from "../../components/icon";


const IconPicker = (props) => {
    const { WapSelect } = window?.wapComponents; 
    const options = Object.entries(icons).map(([key, value]) => ({
        label: (
            <div className="wap-icon-picker-item">
                <Icon name={key} />
                <span>{key}</span>
            </div>
        ),
        value: key
    }));
    
    return <WapSelect className="wap-icon-picker" options={options} {...props} />
};

export default IconPicker;