import { BoxControl as BoxControlComponent } from '@wordpress/components';

const BoxControl = ({ value, onChange }) => {
    return (
        <BoxControlComponent
            values={value}
            onChange={onChange}
        />
    )
}

export default BoxControl;