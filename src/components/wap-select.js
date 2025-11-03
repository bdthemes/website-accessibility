import { Select } from "antd"

const { Option } = Select

const WapSelect = (props) => {
    const { children, options, ...restProps } = props
    
    const renderOptions = () => {
        if (options) {
            return options.map(option => (
                <Option 
                    key={option.value} 
                    value={option.value}
                    disabled={option.disabled}
                >
                    {option.label}
                </Option>
            ))
        }
        return children
    }
    
    return (
        <Select {...restProps}>
            {renderOptions()}
        </Select>
    )
}


WapSelect.Option = Option;
export default WapSelect;