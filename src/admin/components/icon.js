import * as icons from "../assets/icons";
import { cloneElement } from "@wordpress/element";

const Icon = ({ name, ...props }) => {
    const Icon = icons[name];
    
    if (!Icon) return null;

    return cloneElement(Icon, props);
}

export default Icon;