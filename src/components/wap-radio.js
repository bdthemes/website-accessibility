import { Radio } from "antd";

const RadioGroup = ({ children, options, optionType, buttonStyle, ...props }) => {
    // If using button style radio group with options
    if (optionType === 'button' && options) {
        return (
            <Radio.Group {...props} optionType={optionType} buttonStyle={buttonStyle} options={options} />
        );
    }
    
    // If using regular radio group with options
    if (options) {
        return (
            <Radio.Group {...props}>
                {options.map(option => (
                    <Radio key={option.value} value={option.value}>
                        {option.label}
                    </Radio>
                ))}
            </Radio.Group>
        );
    }

    // Default case: just render children
    return <Radio.Group {...props}>{children}</Radio.Group>;
};

// Create WapRadio component that extends Radio
const WapRadio = ({ ...props }) => <Radio {...props} />;
WapRadio.Group = RadioGroup;
WapRadio.Button = Radio.Button;  // Also expose Radio.Button for completeness

export default WapRadio;
