import { BorderBoxControl } from '@wordpress/components';

const BorderControl = ({ value, onChange }) => {
    return (
        <BorderBoxControl
            onChange={ onChange }
            value={ value }
        />
    )
}

export default BorderControl;